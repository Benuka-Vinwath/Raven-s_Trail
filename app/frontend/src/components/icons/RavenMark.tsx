interface RavenMarkProps {
  className?: string;
}

/** Minimal bird-in-flight mark — used as the wordmark glyph and favicon base. */
export default function RavenMark({ className }: RavenMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 32 Q15 12 24 24 Q33 12 44 32"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
