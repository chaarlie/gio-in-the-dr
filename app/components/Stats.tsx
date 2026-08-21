import StatCard from "./StatCard";
import { DEFAULT_LOCALE, type Locale, isLocale } from "../lib/i18n";
import { MESSAGES } from "../lib/messages";
import { locale as rootLocale } from "next/root-params";

/*
  Built from the messages rather than declared at module scope: the labels are
  copy, and copy depends on the locale, which only the component knows.
*/
type HomeMessages = (typeof MESSAGES)["en"]["home"];

function stats(t: HomeMessages) {
  return [
    { big: "4+", label: t.statYears },
    { big: "3", label: t.statLanguages },
    { big: "1:1", label: t.statGuidance },
  ];
}

export default async function Stats() {
  const raw = await rootLocale();
  const locale: Locale = raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = MESSAGES[locale].home;
  const STATS = stats(t);
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-2">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1 bg-accent text-cream rounded-3xl p-7 flex flex-col justify-center">
          <div className="font-display text-2xl font-semibold">{t.statsEyebrow}</div>
          <p className="text-cream/70 text-sm leading-relaxed mt-2">
            {t.statsHeading}
          </p>
        </div>
        {STATS.map((s) => (
          <StatCard key={s.big} big={s.big} label={s.label} />
        ))}
      </div>
    </section>
  );
}
