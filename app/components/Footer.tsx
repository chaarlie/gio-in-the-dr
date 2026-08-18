import Link from "next/link";
import Logo from "./Logo";
import WhatsAppIcon from "./WhatsAppIcon";
import { WA } from "../lib/whatsapp";
import { EMAIL } from "../lib/email";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../lib/instagram";

export default function Footer() {
  return (
    <footer className="mt-20 bg-accent text-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-20 pb-10">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-end pb-14 border-b border-cream/15">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-cream/60 mb-4">
              Let&apos;s talk
            </p>
            <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.02] max-w-xl text-balance">
              Find your place in the Dominican Republic.
            </h2>
          </div>
          <div className="flex flex-col gap-4 items-start">
            <a
              href={WA.general}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2.5 bg-cream text-ink text-[15px] font-bold px-7 py-4 rounded-full no-underline hover:bg-white transition-colors"
            >
              <WhatsAppIcon size={20} className="text-whatsapp" />
              Chat on WhatsApp
            </a>
            {/* Email and Instagram share the underlined-text treatment so the
                column reads as one primary action with two quieter ways to
                reach the same person, rather than three buttons of equal
                weight. Both sit in the same flex column as the button above, so
                all three stay left-aligned on every breakpoint. */}
            <a
              href={`mailto:${EMAIL}`}
              className="text-cream/80 text-[15px] font-medium border-b border-cream/30 pb-0.5 no-underline hover:text-cream transition-colors"
            >
              {EMAIL}
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-cream/80 text-[15px] font-medium border-b border-cream/30 pb-0.5 no-underline hover:text-cream transition-colors"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
              </svg>
              {INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>

        <div className="flex justify-between items-center gap-6 flex-wrap pt-8">
          <div className="text-cream">
            <Logo />
          </div>
          <nav className="flex gap-6 flex-wrap">
            <Link
              href="/properties"
              className="text-cream/75 text-sm font-medium no-underline hover:text-cream transition-colors"
            >
              Properties
            </Link>
            <Link
              href="/blog"
              className="text-cream/75 text-sm font-medium no-underline hover:text-cream transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/#services"
              className="text-cream/75 text-sm font-medium no-underline hover:text-cream transition-colors"
            >
              Services
            </Link>
            <Link
              href="/#about"
              className="text-cream/75 text-sm font-medium no-underline hover:text-cream transition-colors"
            >
              About
            </Link>
            <Link
              href="/#contact"
              className="text-cream/75 text-sm font-medium no-underline hover:text-cream transition-colors"
            >
              Contact
            </Link>
          </nav>
          <div className="text-cream/50 text-sm">
            © 2026 Gio In The DR. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
