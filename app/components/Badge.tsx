import type { ReactNode } from "react";

// Pill capsule. `glass` = translucent over photos (category tag);
// `solid` = near-white price chip.
const VARIANTS = {
  glass:
    "bg-cream/15 text-cream text-xs font-semibold uppercase tracking-wide px-3 py-1.5 backdrop-blur-sm",
  solid: "bg-cream text-ink text-base font-bold px-4 py-2 shadow-sm",
} as const;

export default function Badge({
  variant = "glass",
  className = "",
  children,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`inline-block rounded-full shrink-0 ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}
