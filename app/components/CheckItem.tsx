import type { ReactNode } from "react";

// Filled check-circle + text row (used in the "Real estate in 360°" list).
export default function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-ink leading-snug">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 mt-0.5 text-accent"
      >
        <circle cx="12" cy="12" r="11" fill="currentColor" />
        <path
          d="M7.5 12.5l3 3 6-6.5"
          stroke="var(--color-cream)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}
