"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { type ContractRow, usdCompact } from "@/lib/contratos";

// Instant client-side browse over published PR contracts (search contractor/agency).
export function ContractBrowser({ rows }: { rows: ContractRow[] }) {
  const t = useTranslations("contratos.browser");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.contractorName, r.awardingAgency ?? "", r.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="w-full rounded-xs border-[1.5px] border-ink-line bg-cream-deep px-[18px] py-3.5 text-[15px] text-ink outline-none focus:border-ink"
        />
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
          {t("results", { count: results.length })}
        </span>
      </div>

      {results.length === 0 ? (
        <p className="rounded-xs border border-dashed border-ink-line-strong px-5 py-10 text-center font-mono text-xs uppercase tracking-[0.1em] text-ink-faint">
          {t("none")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-sm border border-ink-line bg-cream">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-line font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
              <tr>
                <th className="px-4 py-2.5">{t("contractor")}</th>
                <th className="px-4 py-2.5">{t("agency")}</th>
                <th className="px-4 py-2.5 text-right">{t("amount")}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-ink-line/60 align-top last:border-0 hover:bg-celeste-mist">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{r.contractorName}</span>
                    {r.description && (
                      <div className="mt-0.5 max-w-[460px] text-xs text-ink-faint">
                        <span className="line-clamp-1">{r.description}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{r.awardingAgency ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-display font-semibold text-rojo">
                    {usdCompact(r.amountUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
