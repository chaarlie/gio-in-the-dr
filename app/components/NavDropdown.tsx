"use client";

import Link from "next/link";
import NavLink from "./NavLink";
import { useEffect, useId, useRef, useState } from "react";

/*
  A top-level nav item that also opens a small menu of sub-pages — Blog, whose
  categories (Travel guides, and "All posts" for the whole index) hang off it
  rather than crowding the top bar.

  The label stays an ordinary link: hovering or focusing the item reveals the
  menu, but clicking "Blog" still goes to /blog. A separate caret button toggles
  the menu for touch and click, since there is no hover there. Opens on hover and
  on focus-within so keyboard users reach it by tabbing; closes on mouse-leave,
  Escape, a tap outside, and choosing an item.
*/
export default function NavDropdown({
  href,
  label,
  items,
}: {
  href: string;
  label: string;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLButtonElement>(null);
  // A short grace period so sliding from the label down to the menu — a gap the
  // pointer crosses — doesn't count as leaving and snap it shut.
  const closeTimer = useRef<number | null>(null);
  const menuId = useId();

  function openNow() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setOpen(true);
  }
  function closeSoon() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 80);
  }

  // A tap outside closes it — the case mouse-leave misses on touch, where there
  // is no leave event. Only listens while open.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onFocus={openNow}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        setOpen(false);
        caretRef.current?.focus();
      }}
    >
      <NavLink
        href={href}
        className="text-sm font-medium pl-4 pr-2 py-2 rounded-full text-ink hover:bg-ink/5 transition-colors no-underline"
      >
        {label}
      </NavLink>
      <button
        ref={caretRef}
        type="button"
        // A disclosure, not an ARIA menu: it reveals a list of page links, which
        // Tab walks — not a menu widget with arrow-key roving. Matches MobileGroup.
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${label} categories`}
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`origin-center transition-transform ${open ? "rotate-180" : ""}`}
          />
        </svg>
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="absolute left-0 top-full mt-1 min-w-48 bg-card border border-line rounded-2xl shadow-lg p-1 z-50"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-ink/5 no-underline"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
