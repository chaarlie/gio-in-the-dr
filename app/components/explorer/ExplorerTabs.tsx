"use client";

import { useRef } from "react";

export type ExplorerView = "areas" | "listings";

const TABS: { id: ExplorerView; label: string }[] = [
  { id: "listings", label: "Properties" },
  { id: "areas", label: "Areas" },
];

/*
  Segmented control built as a real tablist: arrow keys move between tabs and
  roving tabindex keeps a single stop in the tab order, which is what screen
  reader and keyboard users expect from this pattern.
*/
export default function ExplorerTabs({
  view,
  onChange,
  counts,
}: {
  view: ExplorerView;
  onChange: (v: ExplorerView) => void;
  counts: Record<ExplorerView, number>;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const last = TABS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    onChange(TABS[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Browse by"
      className="flex gap-1 p-1 bg-surface rounded-full"
    >
      {TABS.map((t, i) => {
        const active = t.id === view;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`explorer-tab-${t.id}`}
            aria-selected={active}
            aria-controls={`explorer-panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-full px-4 h-9 text-sm font-semibold touch-manipulation transition-colors ${
              active
                ? "bg-accent text-cream"
                : "text-muted hover:text-ink hover:bg-card"
            }`}
          >
            {t.label}
            <span
              className={`text-xs tabular-nums ${active ? "text-cream/70" : "text-muted/70"}`}
            >
              {counts[t.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
