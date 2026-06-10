// Top flag bar — hard-stop stripes (rojo/cream) evoking the Puerto Rican flag.
// Hard stops render as stripes, not a smooth gradient (SPEC §7 design intent).
export function FlagBar() {
  return (
    <div
      className="h-1.5 w-full"
      style={{
        background:
          "linear-gradient(to right, var(--color-rojo) 0%, var(--color-rojo) 20%, var(--color-cream) 20%, var(--color-cream) 40%, var(--color-rojo) 40%, var(--color-rojo) 60%, var(--color-cream) 60%, var(--color-cream) 80%, var(--color-rojo) 80%, var(--color-rojo) 100%)",
      }}
      aria-hidden
    />
  );
}
