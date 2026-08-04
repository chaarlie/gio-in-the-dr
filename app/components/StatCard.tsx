// Beige stat tile: big serif numeral + label. Used in the Stats bar.
export default function StatCard({
  big,
  label,
  className = "",
}: {
  big: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-line rounded-3xl p-6 flex flex-col justify-center ${className}`}
    >
      <div className="font-display text-4xl font-bold leading-none">{big}</div>
      <div className="text-muted text-sm leading-snug mt-3">{label}</div>
    </div>
  );
}
