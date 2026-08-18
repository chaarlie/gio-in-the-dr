import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavLink from "./NavLink";

/*
  Every nav item lives here, including the highlighted first one.

  It used to be split: a hardcoded "Start" link pointing at "/" rendered before
  this array, and only the array was handed to MobileMenu. So the primary item
  existed on desktop and nowhere else — whatever sat in that slot was missing
  from the phone menu entirely. Marking it with `primary` instead keeps one
  source for both navs.
*/
const NAV = [
  { label: "Properties", href: "/#properties", primary: true },
  { label: "Map", href: "/#areas" },
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

        {/* Desktop nav. The logo is already the way home, so the first slot
            carries the listings rather than a second link to "/". */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className={
                item.primary
                  ? "text-sm font-semibold px-4 py-2 rounded-full bg-accent hover:bg-accent-soft text-cream no-underline transition-colors"
                  : "text-sm font-medium px-4 py-2 rounded-full text-ink hover:bg-ink/5 transition-colors no-underline"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <MobileMenu items={NAV} />
      </div>
    </header>
  );
}
