import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppLauncher from "../components/WhatsAppLauncher";

export const metadata: Metadata = {
  title: "Blog — Gio In The DR",
  description:
    "Guides on buying property, residency, taxes and living on the Dominican Republic's north coast.",
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 md:px-8 py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted mb-4">
          Guides & stories
        </p>
        <h1 className="font-display font-bold text-ink text-4xl md:text-6xl text-balance">
          The blog is on the way.
        </h1>
        <p className="text-muted text-lg leading-relaxed mt-5">
          Soon: the 2026 Dominican Republic Buyer&apos;s Guide, area guides for Cabarete &
          Sosúa, and practical notes on residency, taxes and financing — all editable from
          the backend.
        </p>
        <Link
          href="/#contact"
          className="inline-block mt-8 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
        >
          Get notified
        </Link>
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
