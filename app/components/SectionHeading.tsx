import type { ReactNode } from "react";

// Eyebrow + serif title pattern repeated across sections.
// Description/extra content goes in children so each section keeps its own spacing.
type Props = {
  eyebrow?: string;
  title: ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "cream";
  as?: "h1" | "h2";
  className?: string;
  children?: ReactNode;
};

export default function SectionHeading({
  eyebrow,
  title,
  align = "left",
  tone = "ink",
  as: Heading = "h2",
  className = "",
  children,
}: Props) {
  const dark = tone === "cream";
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <p
          className={`text-xs font-semibold tracking-[0.22em] uppercase mb-4 ${
            dark ? "text-cream/60" : "text-muted"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <Heading
        className={`font-display font-bold leading-tight text-balance ${
          Heading === "h1" ? "text-4xl sm:text-5xl lg:text-7xl" : "text-3xl md:text-5xl"
        } ${dark ? "text-cream" : "text-ink"}`}
      >
        {title}
      </Heading>
      {children}
    </div>
  );
}
