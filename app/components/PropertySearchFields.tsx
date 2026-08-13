"use client";

import { useEffect, useRef } from "react";
import { usePropertySearch } from "./PropertySearchProvider";

// Hoisted: these re-render on every keystroke, and there's no React Compiler here.
const SEARCH_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="text-muted shrink-0"
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const FIELD_CARET = (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute right-5 sm:right-6 bottom-[19px] text-muted text-[10px]"
  >
    ▼
  </span>
);

/** Free-text row, with "/" as a page-wide shortcut that jumps here and focuses it. */
export function SearchQueryRow() {
  const { state, actions } = usePropertySearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      // Don't steal "/" from someone typing in a field.
      const active = document.activeElement;
      const tag = active?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }
      const input = inputRef.current;
      if (!input) return;
      e.preventDefault();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      input.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      input.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex items-center gap-3 px-5 sm:px-6 py-4">
      {SEARCH_ICON}
      <input
        ref={inputRef}
        value={state.filters.q}
        onChange={(e) => actions.setFilter("q", e.target.value)}
        type="search"
        name="q"
        spellCheck={false}
        aria-label="Search by name, area or keyword"
        placeholder="Search by name, area or keyword…"
        className="flex-1 bg-transparent py-1.5 text-base text-ink outline-none placeholder:text-muted min-w-0"
      />
      {/* Advertises the shortcut. Hidden on touch, where there's no physical "/" key. */}
      <span
        aria-hidden="true"
        className="hidden lg:block shrink-0 text-[11px] font-semibold text-muted/70 border border-line rounded-md px-1.5 py-0.5"
      >
        /
      </span>
    </div>
  );
}

/*
  The four selects. Hairlines are 1px grid gaps showing the `line` backdrop through.

  The field list comes from the provider rather than a const up here: Location and
  Property type are built from whatever Gio has listed, so they can't be known at module
  scope. The provider memoises them, so this still maps a stable array on every keystroke.
*/
export function SearchFieldGrid() {
  const { state, actions } = usePropertySearch();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border-y border-line">
      {state.fields.map((field) => {
        const value = state.filters[field.key];
        /*
          The options come from the listings, so a shared link can name one that
          no longer exists — ?max=750000 after the ladder shifted, or an area
          with nothing left for sale. A <select> whose value matches no option
          renders blank, which looks broken while the filter is in fact applied.
          Carry the orphan as its own option so the field states what it's doing.
        */
        const orphan = value && !field.options.some((o) => o.value === value);
        return (
          <div key={field.key} className="relative bg-card px-5 sm:px-6 py-4">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                {field.label}
              </span>
              <select
                value={value}
                onChange={(e) => actions.setFilter(field.key, e.target.value)}
                className="mt-2 w-full appearance-none bg-transparent pr-7 text-[15px] font-semibold text-ink cursor-pointer outline-none"
              >
                {orphan ? <option value={value}>{value}</option> : null}
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {FIELD_CARET}
          </div>
        );
      })}
    </div>
  );
}

/** Result count on the left, Clear all / Search on the right. */
export function SearchActionsRow({ onSubmit }: { onSubmit?: () => void }) {
  const { state, actions } = usePropertySearch();
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 sm:px-6 py-4">
      <p className="text-sm text-muted" aria-live="polite">
        {state.resultLabel}
      </p>
      <div className="ml-auto flex items-center gap-3">
        {state.hasFilters ? (
          <button
            type="button"
            onClick={actions.reset}
            className="rounded-full border border-ink/20 px-5 py-3.5 text-sm font-semibold text-ink hover:border-ink transition-colors"
          >
            Clear all ✕
          </button>
        ) : null}
        {onSubmit ? (
          <button
            type="submit"
            className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-cream hover:bg-accent-soft transition-colors"
          >
            Search
          </button>
        ) : null}
      </div>
    </div>
  );
}
