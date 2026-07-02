import { getTranslations } from "next-intl/server";

import { getWireHeadlines } from "@/lib/queries/cable";

// Live El Cable ticker under the header. Pure-CSS marquee (self-contained <style>):
// pauses on hover/focus and freezes for reduced-motion users. Renders nothing when
// the wire is empty.
export async function Chyron() {
  const items = await getWireHeadlines(12);
  if (items.length === 0) return null;

  const t = await getTranslations("chyron");
  // Duplicate the list so translateX(-50%) loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="border-b border-black bg-ink text-cream" aria-label={t("aria")}>
      <div className="flex items-stretch">
        <div className="flex flex-none items-center gap-2 bg-rojo px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-cream">
          <span className="qg-live-dot h-[7px] w-[7px] rounded-full bg-cream" aria-hidden />
          {t("label")}
        </div>
        <div className="qg-ticker relative flex-1 overflow-hidden" tabIndex={0}>
          <div className="qg-track flex w-max whitespace-nowrap py-[9px]">
            {loop.map((it, i) => (
              <a
                key={i}
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-hidden={i >= items.length}
                tabIndex={i >= items.length ? -1 : undefined}
                className="relative flex shrink-0 items-center gap-2.5 px-6 text-[12.5px] text-[#EFE7D6] no-underline after:absolute after:right-0 after:top-1/2 after:h-[11px] after:w-px after:-translate-y-1/2 after:bg-[#4a4238] after:content-[''] hover:text-white"
              >
                <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-celeste">
                  {it.source}
                </span>
                {it.title}
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes qg-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .qg-track { animation: qg-scroll 60s linear infinite; will-change: transform; }
        .qg-ticker:hover .qg-track, .qg-ticker:focus-within .qg-track { animation-play-state: paused; }
        @keyframes qg-pulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
        .qg-live-dot { animation: qg-pulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .qg-track { animation: none; }
          .qg-ticker { overflow-x: auto; }
          .qg-live-dot { animation: none; }
        }
      `}</style>
    </div>
  );
}
