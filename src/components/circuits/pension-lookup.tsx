"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { jurisdictionLabel, type PensionInvestmentRow } from "@/lib/pensiones";
import { cn } from "@/lib/utils";

type Filter = "all" | "state" | "teacher" | "former";
const FILTERS: Filter[] = ["all", "state", "teacher", "former"];

// Real, instant client-side lookup over the seeded pension data (SPEC §9.0).
export function PensionLookup({ rows }: { rows: PensionInvestmentRow[] }) {
  const t = useTranslations("pensiones.lookup");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      // "former exposure" isn't in the seed data — that filter yields nothing for now.
      if (filter === "former") return false;
      if (filter === "state" && r.pensionFundCategory !== "state") return false;
      if (filter === "teacher" && r.pensionFundCategory !== "teacher") return false;
      if (!q) return true;
      const hay = [
        r.pensionFundName,
        r.hedgeFundName,
        r.fundName ?? "",
        jurisdictionLabel(r.pensionFundJurisdiction),
        r.pensionFundJurisdiction ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, filter]);

  return (
    <div>
      <div className="mb-5 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="w-full rounded-xs border-[1.5px] border-ink-line bg-cream-deep px-[18px] py-3.5 text-[15px] text-ink outline-none focus:border-ink"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "cursor-pointer rounded-xs border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
              filter === f
                ? "border-ink bg-ink text-cream"
                : "border-ink-line-strong text-ink-muted hover:border-ink hover:text-ink",
            )}
          >
            {t(f)}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
          {t("results", { count: results.length })}
        </span>
      </div>

      {results.length === 0 ? (
        <p className="rounded-xs border border-dashed border-ink-line-strong px-5 py-10 text-center font-mono text-xs uppercase tracking-[0.1em] text-ink-faint">
          {t("none")}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-px border border-ink-line bg-ink-line max-[1080px]:grid-cols-2 max-[720px]:grid-cols-1">
          {results.map((r) => (
            <div key={r.id} className="bg-cream p-5 transition-colors hover:bg-celeste-mist">
              <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-rojo">
                {jurisdictionLabel(r.pensionFundJurisdiction)}
              </div>
              <Link
                href={`/circuitos/pensiones/${r.pensionFundSlug}`}
                className="mb-3 block font-display text-base font-medium leading-tight text-ink no-underline hover:text-celeste-deep"
              >
                {r.pensionFundName}
              </Link>
              <div className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                {r.amountDisplay}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                {t("via")}{" "}
                <Link
                  href={`/circuitos/pensiones/${r.hedgeFundSlug}`}
                  className="text-ink-muted underline-offset-2 hover:text-celeste-deep hover:underline"
                >
                  {r.hedgeFundName}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
