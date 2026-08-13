import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

const NAV = [
  { label: "Properties", href: "/#properties" },
  { label: "Services", href: "/#services" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function Header() {
  // `relative` so the mobile menu can anchor to the header's full width rather
  // than to the padded max-w-7xl row inside it — a menu that stops short of the
  // screen edge is the thing that read as a floating card.
  return (
    <header className="sticky top-0 z-50 relative bg-cream/80 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Gio In The DR — home"
          className="text-ink no-underline shrink-0"
        >
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

        <MobileMenu items={NAV} />
      </div>
    </header>
  );
}
