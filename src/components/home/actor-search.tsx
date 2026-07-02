"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { kindKey, type SearchResult } from "@/lib/search";

// Proper nouns — same in both locales. All verified to resolve to seeded entities
// and chosen to span circuits (a vulture fund, two disaster contractors, a pension).
const EXAMPLES = ["Oaktree Capital", "AECOM", "Tetra Tech", "Oregon"];

// Live cross-circuit actor search. Typeahead against /api/search; each hit routes
// to the right circuit page. Accessible combobox with keyboard nav.
export function ActorSearch() {
  const t = useTranslations("search");
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced fetch. All setState runs inside the timeout/promise callbacks (not
  // synchronously in the effect body); the short-query reset lives in onChange.
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) return;
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data: { results?: SearchResult[] }) => {
          setResults(data.results ?? []);
          setOpen(true);
          setActive(-1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQ(v);
    if (v.trim().length < 2) {
      setResults([]);
      setOpen(false);
    }
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(r: SearchResult) {
    setOpen(false);
    router.push(r.href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active] ?? results[0];
      if (r) go(r);
    }
  }

  return (
    <div ref={boxRef} className="relative max-w-[680px]">
      <div className="flex items-center gap-3 rounded-xs border-[1.5px] border-ink bg-cream-deep px-[18px] py-[15px] focus-within:border-celeste-deep">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="shrink-0 text-ink-muted"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={q}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (results.length) setOpen(true);
          }}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          role="combobox"
          aria-expanded={open}
          aria-controls="actor-search-list"
          aria-autocomplete="list"
          className="flex-1 border-0 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-faint"
        />
        {loading && (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
            {t("loading")}
          </span>
        )}
      </div>

      {open && (
        <ul
          id="actor-search-list"
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-[340px] w-full overflow-auto rounded-xs border border-ink-line-strong bg-cream"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
              {t("none")}
            </li>
          ) : (
            results.map((r, i) => (
              <li key={`${r.entityType}-${r.slug}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={`flex w-full items-center justify-between gap-3 border-b border-ink-line/70 px-4 py-3 text-left last:border-0 ${
                    i === active ? "bg-celeste-mist" : ""
                  }`}
                >
                  <span className="font-display text-[15px] text-ink">{r.name}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                    {t(`kind.${kindKey(r.entityType)}`)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          {t("try")}
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setQ(ex)}
            className="rounded-xs border border-ink-line-strong px-2.5 py-1 font-mono text-[11px] text-ink-muted hover:border-rojo hover:text-rojo"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
