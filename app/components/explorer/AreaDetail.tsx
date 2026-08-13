import type { Area } from "../../lib/areas";

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

      {/*
        A real <table>, not flex rows pretending to be one. These are label/value
        pairs about one subject, which is what a table is; as divs, a screen
        reader read them as one run-on line with no tie between "HOA" and its
        figure, and none of the row semantics that let you navigate them.

        w-full so it spans whatever it is given — the narrow explorer panel on
        desktop, the full width of the phone. overflow-x-auto is the escape valve
        for a long HOA string on a 320px screen: the table scrolls inside its own
        box instead of widening the page.
      */}
      {facts.length > 0 ? (
        <div className="mt-2 -mx-1 px-1 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="sr-only">Key facts for {area.name}</caption>
            <tbody>
              {facts.map((f) => (
                <tr key={f.label} className="border-b border-line/60 last:border-0">
                  <th
                    scope="row"
                    className="text-left font-normal text-muted py-2 pr-3 whitespace-nowrap"
                  >
                    {f.label}
                  </th>
                  {/* tabular-nums so the figures line up column-wise down the table */}
                  <td className="text-right font-semibold text-ink tabular-nums py-2">
                    {f.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {area.activities.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 mt-3">
          {area.activities.map((a) => (
            <li
              key={a}
              className="text-xs font-semibold uppercase tracking-wide text-muted bg-surface rounded-full px-2.5 py-1"
            >
              {a}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
