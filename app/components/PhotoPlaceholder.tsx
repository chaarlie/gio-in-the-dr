// Placeholder for property photos until they come from Sanity.
export default function PhotoPlaceholder({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={`flex items-center justify-center ${
        tone === "dark"
          ? "bg-gradient-to-br from-accent-soft to-accent text-cream/20"
          : "bg-gradient-to-br from-panel to-surface text-muted/50"
      } ${className}`}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 9.5 12 4l8 5.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
