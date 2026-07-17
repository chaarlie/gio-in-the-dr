// GIO wordmark + a cleaner little palm. Inherits color from `text-*` (currentColor),
// so it works on cream (text-ink) or on the dark footer (text-cream).
export default function Logo() {
  return (
    <div className="inline-block leading-none">
      <div className="flex items-end gap-1.5">
        <span className="font-display font-bold text-[21px] leading-none tracking-[0.24em]">
          GIO
        </span>
        <svg
          width="27"
          height="27"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
          className="-mb-[3px] block shrink-0 overflow-visible"
        >
          {/* trunk */}
          <path
            d="M20 37 C18.6 30 21 23 20 15.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* fronds */}
          <g
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 15.5 C12 12.5 6 13.5 2 18.5" />
            <path d="M20 15.5 C13 8.5 8 6.5 4 6.5" />
            <path d="M20 15.5 C18.6 8.5 18 3.5 17.6 1" />
            <path d="M20 15.5 C21.6 8.5 23 4 24.2 1.4" />
            <path d="M20 15.5 C27 8.5 32 6.5 36 6.5" />
            <path d="M20 15.5 C28 12.5 34 13.5 38 18.5" />
          </g>
          {/* two little coconuts tucked under the crown */}
          <circle cx="18.4" cy="18" r="1" fill="currentColor" />
          <circle cx="21.6" cy="18.4" r="1" fill="currentColor" />
        </svg>
      </div>
      <div className="text-[10px] font-semibold tracking-[0.42em] opacity-60 mt-[5px]">
        IN THE DR
      </div>
    </div>
  );
}
