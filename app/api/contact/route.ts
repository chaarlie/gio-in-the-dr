import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/*
  The form posts an id, not a label, so that an enquiry from the Spanish site
  and one from the English site arrive identically. The subject line Gio filters
  on is written here, in English, whichever language the sender was reading.

  An unrecognised id falls through to itself rather than being dropped: a value
  in the subject line is always more useful than a blank one.
*/
const INTEREST_LABELS: Record<string, string> = {
  buying: "Buying a home",
  investment: "Investment property",
  preConstruction: "Pre-construction",
  relocation: "Relocation & residency",
  question: "Just have a question",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const rawInterest = String(body.interest ?? "Contact form").trim();
  const interest = INTEREST_LABELS[rawInterest] ?? rawInterest;
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
    subject: `Website enquiry — ${interest}`,
    text: `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`,
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send failed", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }
}
