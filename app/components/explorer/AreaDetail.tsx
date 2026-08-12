import type { Area } from "../../lib/areas";

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-1.5 text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink tabular-nums">{value}</span>
    </div>
  );
}

/** Facts for one area. Empty values are omitted, never shown as placeholders. */
export default function AreaDetail({ area }: { area: Area }) {
  const perM2 = area.marketPricePerM2 ?? area.avgPricePerM2;
  const facts = [
    { label: "Price per m²", value: perM2 ? `$${Math.round(perM2).toLocaleString()}` : null },
    { label: "Walk to beach", value: area.walkToBeach },
    { label: "Drive to beach", value: area.driveToBeach },
    { label: "HOA", value: area.hoa },
  ].filter((f) => f.value);

  if (!area.blurb && facts.length === 0 && area.activities.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-line">
      {area.blurb ? (
        <p className="text-muted text-sm leading-relaxed text-pretty">{area.blurb}</p>
      ) : null}

      {facts.length > 0 ? (
        <div className="mt-2">
          {facts.map((f) => (
            <Fact key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      ) : null}

      {area.activities.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 mt-3">
          {area.activities.map((a) => (
            <li
              key={a}
              className="text-[11px] font-semibold uppercase tracking-wide text-muted bg-surface rounded-full px-2.5 py-1"
            >
              {a}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
