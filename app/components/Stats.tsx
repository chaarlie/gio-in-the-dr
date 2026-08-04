import StatCard from "./StatCard";

const STATS = [
  { big: "4+", label: "Years helping foreigners buy in the DR" },
  { big: "3", label: "Languages spoken — English, Spanish, Italian" },
  { big: "1:1", label: "Personal guidance from search to closing" },
];

export default function Stats() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-2">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1 bg-accent text-cream rounded-3xl p-7 flex flex-col justify-center">
          <div className="font-display text-2xl font-semibold">Highlights</div>
          <p className="text-cream/70 text-sm leading-relaxed mt-2">
            A trilingual agent who moved here herself — helping foreigners buy with
            confidence.
          </p>
        </div>
        {STATS.map((s) => (
          <StatCard key={s.big} big={s.big} label={s.label} />
        ))}
      </div>
    </section>
  );
}
