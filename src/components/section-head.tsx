import type { ReactNode } from "react";

// Section header: numbered mono label, display title (with <em> accent), intro,
// and an optional right-aligned mono side block (SPEC §7).
export function SectionHead({
  num,
  label,
  title,
  intro,
  side,
}: {
  num?: string;
  label: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  side?: string;
}) {
  return (
    <div className="mb-15 flex items-end justify-between gap-10 max-[720px]:flex-col max-[720px]:items-start">
      <div className="max-w-[720px]">
        <div className="mb-3.5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-rojo">
          {num && <span className="font-medium text-ink-faint">{num}</span>}
          {label}
        </div>
        <h2 className="mb-4.5 font-display text-[clamp(36px,4.5vw,56px)] font-medium leading-[1.02] tracking-[-0.03em] [&_em]:italic [&_em]:text-celeste-deep">
          {title}
        </h2>
        {intro && (
          <p className="max-w-[620px] text-base leading-[1.65] text-ink-muted">
            {intro}
          </p>
        )}
      </div>
      {side && (
        <div className="shrink-0 whitespace-pre-line text-right font-mono text-[11px] uppercase leading-[1.7] tracking-[0.14em] text-ink-faint max-[720px]:text-left">
          {side}
        </div>
      )}
    </div>
  );
}
