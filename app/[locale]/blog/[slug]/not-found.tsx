import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import WhatsAppLauncher from "../../../components/WhatsAppLauncher";

export default function PostNotFound() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-2xl mx-auto px-6 md:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-ink text-4xl md:text-5xl text-balance">
          That guide isn&apos;t here.
        </h1>
        <p className="text-muted text-lg leading-relaxed mt-5">
          The link may be out of date, or the post may not be published yet.
        </p>
        <Link
          href="/blog"
          className="inline-block mt-8 bg-accent hover:bg-accent-soft text-cream text-sm font-semibold px-7 py-4 rounded-full transition-colors no-underline"
        >
          Read the other guides
        </Link>
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
