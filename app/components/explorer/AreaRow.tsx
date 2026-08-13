"use client";

import { formatPrice } from "../../lib/format";
import type { Area } from "../../lib/areas";

export default function AreaRow({
  area,
  selected,
  onSelect,
}: {
  area: Area;
  selected: boolean;
  onSelect: (slug: string | null) => void;
}) {
  const summary =
    area.listingCount > 0
      ? `${area.listingCount} ${area.listingCount === 1 ? "listing" : "listings"}${
          area.priceFrom ? ` · from ${formatPrice(area.priceFrom)}` : ""
        }`
      : "No listings yet";

  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(selected ? null : area.slug)}
        className={`w-full flex items-center gap-2.5 text-left py-2.5 px-2 rounded-xl touch-manipulation transition-colors ${
          selected ? "bg-surface" : "hover:bg-surface/60"
        }`}
      >
        <span
          aria-hidden="true"
          className="w-3 h-3 rounded-[3px] shrink-0"
          style={{ background: area.color }}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink truncate">{area.name}</span>
          <span className="block text-xs text-muted tabular-nums">{summary}</span>
        </span>
        <span aria-hidden="true" className="text-muted text-xs shrink-0">
          {selected ? "✕" : "→"}
        </span>
      </button>
    </li>
  );
}
