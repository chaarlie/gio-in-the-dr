// GIO wordmark + little palm doodle. Inherits color from `text-*` (currentColor),
// so it works on cream (text-ink) or on a dark footer (text-cream) later.
export default function Logo() {
  return (
    <div className="inline-block leading-none">
      <div className="flex items-end gap-1">
        <span className="font-display font-bold text-[21px] leading-none tracking-[0.26em]">
          GIO
        </span>
        <svg
          width="30"
          height="26"
          viewBox="0 0 46 40"
          fill="none"
          aria-hidden="true"
          className="-mb-[3px] block shrink-0 overflow-visible"
        >
          <path
            d="M20 37 C19 28 21 19 22 14"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 14 C15 12 9 13 5 17.5" />
            <path d="M22 14 C16 8 12 6 8 5" />
            <path d="M22 14 C20 7 19 3 19 0.5" />
            <path d="M22 14 C26 8 29 5 33 4" />
            <path d="M22 14 C30 9 36 9 41 12" />
            <path d="M22 14 C31 13 38 16 42 20.5" />
          </g>
          <circle cx="20" cy="15.6" r="1.1" fill="currentColor" />
          <circle cx="24" cy="15.6" r="1.1" fill="currentColor" />
        </svg>
      </div>
      <div className="text-[10px] font-semibold tracking-[0.42em] opacity-60 mt-[5px]">
        IN THE DR
      </div>
    </div>
  );
}
