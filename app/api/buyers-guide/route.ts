import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/*
  Lead capture for the gated buyer's-guide download.

  The client posts here before it starts the download, so a name and a valid
  email are the gate. The email to Gio is best-effort: a valid submission always
  returns success and lets the download proceed — a hiccup in her SMTP is not the
  visitor's problem, and the lead is logged server-side so it can be recovered.
  Only a missing or malformed field is rejected, which is the whole point of the
  form. (There is no durable store yet; a CRM or a Sanity `lead` type is the next
  step if these should outlive the inbox.)

  Transport configured the same way as /api/contact.
*/
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  const when = new Date().toISOString();
  const lead = `Name: ${name}\nEmail: ${email}\nConsented to promotional emails: yes (by downloading)\nWhen: ${when}`;

  try {
    if (process.env.SMTP_HOST) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_TO,
        subject: `Buyer's guide download — ${name}`,
        text: lead,
        replyTo: email,
      });
    } else {
      // No mail configured (local/preview): keep the lead in the logs rather
      // than dropping it, and still let the download through.
      console.log(`[buyers-guide] lead (no SMTP configured)\n${lead}`);
    }
  } catch (error) {
    // Logged, not surfaced: the visitor filled the form correctly and should get
    // the guide regardless of a mail-send failure.
    console.error("[buyers-guide] lead email failed", error);
  }

  return NextResponse.json({ success: true });
}
