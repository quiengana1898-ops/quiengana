// Quién Gana logo — the 1895 Puerto Rican flag (celeste/light-blue triangle), the
// independence/resistance variant the whole palette is built from. Inline SVG so it
// scales crisply and tracks the design tokens (fills reference the CSS palette vars).
// Decorative: the wordmark sits beside it, so it's aria-hidden.
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {/* Five stripes: red base, two white bands (3 red / 2 white). */}
      <rect width="900" height="600" fill="var(--color-rojo)" />
      <rect y="120" width="900" height="120" fill="#ffffff" />
      <rect y="360" width="900" height="120" fill="#ffffff" />
      {/* Celeste triangle from the hoist. */}
      <path d="M0 0 L520 300 L0 600 Z" fill="var(--color-celeste)" />
      {/* White five-pointed star. */}
      <path d="M175 195 L199.7 266 L274.9 267.6 L214.9 313 L236.7 384.9 L175 342 L113.3 384.9 L135 313 L75.1 267.6 L150.3 266 Z" fill="#ffffff" />
    </svg>
  );
}
