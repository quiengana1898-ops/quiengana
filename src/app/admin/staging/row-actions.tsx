"use client";

import { useState, useTransition } from "react";

import {
  publishContract,
  publishEntity,
  rejectContract,
  rejectEntity,
} from "@/app/admin/actions";

type Kind = "contract" | "entity";

// Publish / reject buttons for a staged row. Calls the role-gated server actions.
export function RowActions({ kind, id }: { kind: Kind; id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  const publish = () =>
    run(kind === "contract" ? () => publishContract(id) : () => publishEntity(id));
  const reject = () =>
    run(kind === "contract" ? () => rejectContract(id) : () => rejectEntity(id));

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="font-mono text-[10px] text-rojo">{error}</span>}
      <button
        type="button"
        onClick={publish}
        disabled={pending}
        className="cursor-pointer rounded-xs bg-celeste-deep px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Publish
      </button>
      <button
        type="button"
        onClick={reject}
        disabled={pending}
        className="cursor-pointer rounded-xs border border-ink-line-strong px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-rojo hover:text-rojo disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
