import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import WhatsAppLauncher from "../../../components/WhatsAppLauncher";
import { WA } from "../../../lib/whatsapp";
import { MESSAGES } from "../../../lib/messages";
import { DEFAULT_LOCALE } from "../../../lib/i18n";

/*
  Listings come off the market. Someone landing here followed a real link to something
  Gio really had, so the page offers the two useful next steps rather than an apology.
*/
export default function PropertyNotFound() {
  // A not-found page receives no route params, so there is no locale to
  // read — Next renders it outside the matched segment. Default it is.
  const t = MESSAGES[DEFAULT_LOCALE].properties;
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-2xl mx-auto px-6 md:px-8 py-24 text-center">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted mb-4">
          {t.notFoundEyebrow}
        </p>
        <h1 className="font-display font-bold text-ink text-4xl md:text-5xl text-balance">
          {t.notFoundHeading}
        </h1>
        <p className="text-muted text-lg leading-relaxed mt-5"> {t.notFoundBody}
          </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <a
            href={WA.general}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
          >
            {t.askAvailable}
          </a>
          <Link
            href="/properties"
            className="border border-ink/20 hover:border-ink text-ink text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
          >{t.allProperties}</Link>
        </div>
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
