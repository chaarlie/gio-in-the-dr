"use client";

import { useMemo, useState } from "react";
import { monthlyHoa } from "../lib/properties";
import { distanceMetres, formatDistance, walkMinutes, PACES, type Point } from "../lib/geo";
import { useMessages } from "./LocaleProvider";

/*
  The two numbers a buyer actually works out on paper, made interactive.

  Both are shared by the explorer panel and the standalone property page, like
  the gallery — the same property should not answer the same question two
  different ways depending on how you arrived at it.

  Everything here is derived from Gio's own fields. Nothing invents a tax rate,
  an appreciation curve or a rental yield: those are professional claims, and
  the blog posts making them are sitting unpublished for exactly that reason.
*/

/** The pace names, from the catalogue rather than the PACES constant. */
function paceLabel(t: ReturnType<typeof useMessages>["calculators"], id: string) {
  return id === "stroll" ? t.paceStroll : id === "brisk" ? t.paceBrisk : t.paceWalk;
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface/60 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{title}</h3>
      {children}
    </section>
  );
}

/* ── HOA ─────────────────────────────────────────────────────────────────── */

function HoaCalculator({
  hoaAmount,
  hoaUnit,
  areaM2,
}: {
  hoaAmount: number | null;
  hoaUnit: string | null;
  areaM2: number | null;
}) {
  const t = useMessages().calculators;
  const [yearly, setYearly] = useState(false);
  /*
    Only meaningful when the fee scales with floor area. For a flat fee the
    answer is the same at every size, and a slider that changes nothing is worse
    than no slider.
  */
  const perM2 = hoaUnit === "per-m2-month";
  const [size, setSize] = useState(areaM2 ?? 120);

  const effectiveArea = perM2 ? size : areaM2;
  const monthly = monthlyHoa(hoaAmount, hoaUnit, effectiveArea);
  if (monthly === null) return null;

  const shown = yearly ? monthly * 12 : monthly;
  const rate = effectiveArea ? monthly / effectiveArea : null;

  return (
    <Panel title={t.hoaTitle}>
      <p className="font-display text-3xl font-bold text-ink mt-2 tabular-nums">
        {usd(shown)}
        <span className="text-base font-semibold text-muted"> {yearly ? t.perYear : t.perMonth}</span>
      </p>

      {/* The comparable number. Two buildings quote flat and per-m², and $433
          against $2.09 compares nothing until both are per m². */}
      {rate !== null ? (
        <p className="text-sm text-muted mt-1 tabular-nums">
          ${rate.toFixed(2)} {t.perM2Month}
          {perM2 && areaM2 ? ` · ${Math.round(size)} m²` : null}
        </p>
      ) : null}

      <div className="flex gap-1 p-1 bg-card rounded-full mt-3 w-fit" role="group" aria-label={t.period}>
        {[
          { id: "month", label: t.monthly },
          { id: "year", label: t.yearly },
        ].map((p) => {
          const active = (p.id === "year") === yearly;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setYearly(p.id === "year")}
              aria-pressed={active}
              className={`rounded-full px-4 h-9 text-sm font-semibold transition-colors ${
                active ? "bg-accent text-cream" : "text-muted hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {perM2 ? (
        <div className="mt-4">
          <label
            htmlFor="hoa-size"
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="text-muted">{t.tryAnotherSize}</span>
            <span className="font-semibold text-ink tabular-nums">{Math.round(size)} m²</span>
          </label>
          <input
            id="hoa-size"
            type="range"
            min={40}
            max={400}
            step={5}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full mt-2 accent-accent"
          />
          <p className="text-xs text-muted mt-1.5">
            {t.byFloorArea}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted mt-3">
          {t.flatFee}
        </p>
      )}
    </Panel>
  );
}

/* ── Beach ───────────────────────────────────────────────────────────────── */

function BeachDistance({
  location,
  beachPoint,
  walkToBeachMin,
  areaName,
}: {
  location: Point | null;
  beachPoint: Point | null;
  walkToBeachMin: number | null;
  areaName: string | null;
}) {
  const t = useMessages().calculators;
  const [pace, setPace] = useState(1); // index into PACES; "Walking" is the middle
  const metres = useMemo(
    () => (location && beachPoint ? distanceMetres(location, beachPoint) : null),
    [location, beachPoint],
  );

  // Nothing measurable and no timing from Gio — say nothing rather than guess.
  if (metres === null && walkToBeachMin === null) return null;

  const current = PACES[pace];

  return (
    <Panel title={t.beachTitle}>
      {metres !== null ? (
        <>
          <p className="font-display text-3xl font-bold text-ink mt-2 tabular-nums">
            {formatDistance(metres)}
            <span className="text-base font-semibold text-muted"> {t.straightLine}</span>
          </p>
          <p className="text-sm text-muted mt-1 tabular-nums">
            {t.aboutMinutes(walkMinutes(metres, current.metresPerMinute), paceLabel(t, current.id))}
          </p>

          <div className="flex gap-1 p-1 bg-card rounded-full mt-3 w-fit" role="group" aria-label={t.pace}>
            {PACES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPace(i)}
                aria-pressed={i === pace}
                className={`rounded-full px-3.5 h-9 text-sm font-semibold transition-colors ${
                  i === pace ? "bg-accent text-cream" : "text-muted hover:text-ink"
                }`}
              >
                {paceLabel(t, p.id)}
              </button>
            ))}
          </div>

          {/* A line you can read at a glance: where this sits between the sand
              and a ten-minute walk, which is roughly where "beachfront" stops
              meaning anything. */}
          <div className="mt-4" aria-hidden="true">
            <div className="h-2 rounded-full bg-card overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-[width] duration-300"
                style={{ width: `${Math.min(100, (metres / 850) * 100)}%` }}
              />
            </div>
            <p className="flex justify-between text-xs text-muted mt-1.5">
              <span>{t.onTheSand}</span>
              <span>{t.tenMinAway}</span>
            </p>
          </div>

          <p className="text-xs text-muted mt-3">
            {t.straightLineNote(areaName)}
            {walkToBeachMin ? t.gioTimes(walkToBeachMin) : ""}
          </p>
        </>
      ) : (
        <>
          <p className="font-display text-3xl font-bold text-ink mt-2 tabular-nums">
            {walkToBeachMin} min
            <span className="text-base font-semibold text-muted"> {t.minWalk}</span>
          </p>
          <p className="text-xs text-muted mt-2">
            {t.gioTiming}
          </p>
        </>
      )}
    </Panel>
  );
}

/* ── Both ────────────────────────────────────────────────────────────────── */

export default function PropertyCalculators({
  hoaAmount,
  hoaUnit,
  areaM2,
  location,
  beachPoint,
  walkToBeachMin,
  areaName,
  className = "",
}: {
  hoaAmount: number | null;
  hoaUnit: string | null;
  areaM2: number | null;
  location: Point | null;
  beachPoint: Point | null;
  walkToBeachMin: number | null;
  areaName: string | null;
  className?: string;
}) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      <HoaCalculator hoaAmount={hoaAmount} hoaUnit={hoaUnit} areaM2={areaM2} />
      <BeachDistance
        location={location}
        beachPoint={beachPoint}
        walkToBeachMin={walkToBeachMin}
        areaName={areaName}
      />
    </div>
  );
}
