import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Mono eyebrow label with a leading rule (SPEC §7). Tone sets accent color.
export function Eyebrow({
  children,
  tone = "rojo",
  className,
}: {
  children: ReactNode;
  tone?: "rojo" | "celeste";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] before:block before:h-px before:w-6 before:content-['']",
        tone === "celeste"
          ? "text-celeste before:bg-celeste"
          : "text-rojo before:bg-rojo",
        className,
      )}
    >
      {children}
    </div>
  );
}
