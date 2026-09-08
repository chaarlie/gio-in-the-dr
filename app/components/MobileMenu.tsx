"use client";

import NavLink from "./NavLink";
import { useEffect, useId, useRef, useState } from "react";

/*
  The small-screen nav.

  This was a JS-free <details> menu, which is a good default but breaks on a
  single-page site: every item is an in-page anchor, so tapping one navigates
  without unmounting anything and the panel stays open over the section you just
  jumped to. Nothing closes it but a second tap on the button.

  So it is stateful now, and closes on the three things that should close it —
  choosing an item, Escape, and a tap outside. The cost is one small client
  component; the header around it stays a server component.
*/
type Item = { label: string; href: string; children?: { label: string; href: string }[] };

export default function MobileMenu({
  items,
  switcher,
}: {
  items: Item[];
  /** The language toggle, shown inside the panel where the desktop one is hidden. */
  switcher?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Focus goes back to the control that opened the panel, or it lands on
      // <body> and the next Tab restarts from the top of the page.
      buttonRef.current?.focus();
    }

    /*
      pointerdown, not click: on iOS a tap outside an open panel would otherwise
      both close it and activate whatever sits underneath.
    */
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    /* Not `relative`: the panel below anchors to the <header>, so it can run the
       full width of the screen. */
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="-mr-1 w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {/* Two paths, not a swap: morphing between them animates transform only,
              and the reduced-motion rule in globals.css flattens it to a cut. */}
          <path
            d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          ref={panelRef as React.RefObject<HTMLElement>}
          /*
            Edge to edge and square: it reads as a panel the header opens, not a
            card hovering over the page. Rows are full-bleed too, so the whole
            width of the screen is the hit target rather than a pill inset
            inside it.

            max-h + overscroll-contain stop a long menu scrolling the page
            behind it; safe-area padding keeps the last row clear of the home
            indicator.
          */
          className="absolute inset-x-0 top-full max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain bg-card border-b border-line shadow-lg flex flex-col pb-[env(safe-area-inset-bottom)]"
        >
          {items.map((item) =>
            item.children ? (
              <MobileGroup key={item.href} item={item} onNavigate={() => setOpen(false)} />
            ) : (
              <NavLink
                key={item.href}
                href={item.href}
                onNavigate={() => setOpen(false)}
                className="flex items-center min-h-14 px-6 border-b border-line last:border-0 text-lg font-medium text-ink hover:bg-ink/5 active:bg-ink/10 no-underline"
              >
                {item.label}
              </NavLink>
            ),
          )}
          {/* The desktop toggle is hidden below sm, so the panel carries its own —
              otherwise a phone has no way to change language at all. */}
          {switcher ? <div className="px-6 py-4">{switcher}</div> : null}
        </nav>
      ) : null}
    </div>
  );
}

/*
  A nav row that expands to show its sub-pages — Blog and its categories.

  Deliberately plainer than the desktop dropdown: no hover, no sliding underline,
  just a caret that toggles the list open. The label still navigates (tapping
  "Blog" goes to /blog and closes the menu); the separate caret button, sized to
  the row so it's an easy target, does the expanding.
*/
function MobileGroup({
  item,
  onNavigate,
}: {
  item: Item;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  return (
    <div className="border-b border-line last:border-0">
      <div className="flex items-center">
        <NavLink
          href={item.href}
          onNavigate={onNavigate}
          className="flex-1 flex items-center min-h-14 px-6 text-lg font-medium text-ink hover:bg-ink/5 active:bg-ink/10 no-underline"
        >
          {item.label}
        </NavLink>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-label={`${item.label} categories`}
          onClick={() => setExpanded((v) => !v)}
          className="w-14 min-h-14 flex items-center justify-center text-ink hover:bg-ink/5 active:bg-ink/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`origin-center transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </svg>
        </button>
      </div>
      {expanded ? (
        <div id={listId}>
          {item.children?.map((child) => (
            <NavLink
              key={child.href}
              href={child.href}
              onNavigate={onNavigate}
              className="flex items-center min-h-12 pl-10 pr-6 text-base font-medium text-muted hover:text-ink hover:bg-ink/5 active:bg-ink/10 no-underline"
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}
