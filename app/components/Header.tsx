import Link from "next/link";
import Logo from "./Logo";

const NAV = [
  { label: "Properties", href: "#properties" },
  { label: "Services", href: "#services" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "#about" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Gio In The DR — home" className="text-ink no-underline">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-accent text-cream no-underline"
          >
            Start
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium px-4 py-2 rounded-full text-ink hover:bg-ink/5 transition-colors no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu — native <details>, no JS */}
        <details className="md:hidden relative [&_summary::-webkit-details-marker]:hidden">
          <summary
            aria-label="Open menu"
            className="list-none cursor-pointer -mr-1 w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </summary>
          <nav className="absolute right-0 top-full mt-2 w-52 bg-card border border-line rounded-2xl shadow-xl p-2 flex flex-col">
            <Link href="/" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-ink hover:bg-ink/5 no-underline">
              Start
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-ink/5 no-underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
