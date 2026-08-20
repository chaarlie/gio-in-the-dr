import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import WhatsAppLauncher from "../../../components/WhatsAppLauncher";
import { MESSAGES } from "../../../lib/messages";
import { DEFAULT_LOCALE } from "../../../lib/i18n";

export default function PostNotFound() {
  // A not-found page receives no route params, so there is no locale to
  // read — Next renders it outside the matched segment. Default it is.
  const t = MESSAGES[DEFAULT_LOCALE].blog;
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-2xl mx-auto px-6 md:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-ink text-4xl md:text-5xl text-balance">
          {t.notFoundHeading}
        </h1>
        <p className="text-muted text-lg leading-relaxed mt-5">
          {t.notFoundBody}
        </p>
        <Link
          href="/blog"
          className="inline-block mt-8 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
        >
          {t.readOthers}
        </Link>
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
