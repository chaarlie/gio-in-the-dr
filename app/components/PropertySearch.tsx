"use client";

export type SearchOption = { value: string; label: string };

export type SearchField = {
  label: string;
  value: string;
  options: SearchOption[];
  onChange: (value: string) => void;
};

// Hoisted: this component re-renders on every keystroke, and the project has no React
// Compiler, so static JSX would otherwise be rebuilt each time.
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

/*
  Property search banner. Layout follows the reference Gio sent; every colour comes from
  the design-system tokens instead (accent/cream/line/muted) — no coral. Card fill + 24px
  radius + hairline, and no shadow: the system reserves shadows for floating chrome.

  Hairlines between fields are drawn with `gap-px` over a `bg-line` grid so the dividers
  stay correct at every breakpoint without per-cell border juggling.
*/
export default function PropertySearch({
  query,
  onQueryChange,
  fields,
  resultLabel,
  hasFilters,
  onReset,
  onSubmit,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  fields: SearchField[];
  resultLabel: string;
  hasFilters: boolean;
  onReset: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      role="search"
      aria-label="Search properties"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="bg-card border border-line rounded-3xl overflow-hidden"
    >
      {/* Free-text row */}
      <div className="flex items-center gap-3 px-5 sm:px-6 py-4">
        {SEARCH_ICON}
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          type="search"
          aria-label="Search by name, area or keyword"
          placeholder="Search by name, area or keyword…"
          className="flex-1 bg-transparent py-1.5 text-base text-ink outline-none placeholder:text-muted min-w-0"
        />
      </div>

      {/* Field grid — hairlines are the 1px gaps showing the `line` backdrop through */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border-y border-line">
        {fields.map((field) => (
          <div key={field.label} className="relative bg-card px-5 sm:px-6 py-4">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                {field.label}
              </span>
              <select
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="mt-2 w-full appearance-none bg-transparent pr-7 text-[15px] font-semibold text-ink cursor-pointer outline-none"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {FIELD_CARET}
          </div>
        ))}
      </div>

      {/* Result count + actions */}
      <div className="flex flex-wrap items-center gap-3 px-5 sm:px-6 py-4">
        <p className="text-sm text-muted" aria-live="polite">
          {resultLabel}
        </p>
        <div className="ml-auto flex items-center gap-3">
          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-ink/20 px-5 py-3.5 text-sm font-semibold text-ink hover:border-ink transition-colors"
            >
              Clear all ✕
            </button>
          )}
          <button
            type="submit"
            className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-cream hover:bg-accent-soft transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
