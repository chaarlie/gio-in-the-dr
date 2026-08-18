import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WhatsAppLauncher from "../../components/WhatsAppLauncher";
import { WA } from "../../lib/whatsapp";

/*
  Listings come off the market. Someone landing here followed a real link to something
  Gio really had, so the page offers the two useful next steps rather than an apology.
*/
export default function PropertyNotFound() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-2xl mx-auto px-6 md:px-8 py-24 text-center">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted mb-4">
          No longer listed
        </p>
        <h1 className="font-display font-bold text-ink text-4xl md:text-5xl text-balance">
          This property isn&apos;t available.
        </h1>
        <p className="text-muted text-lg leading-relaxed mt-5">
          It may have sold, or the link may be out of date. Gio usually has something
          comparable that never made it to the site.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <a
            href={WA.general}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
          >
            Ask Gio what&apos;s available
          </a>
          <Link
            href="/properties"
            className="border border-ink/20 hover:border-ink text-ink text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
          >
            Browse all properties
          </Link>
        </div>
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
