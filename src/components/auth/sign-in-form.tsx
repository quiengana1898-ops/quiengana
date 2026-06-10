"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

// Magic-link sign-in. Sends an OTP email; the link returns the user to
// /auth/callback (PKCE), which establishes the session.
export function SignInForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Contributors self-register (SPEC §6). Restrict per-flow if needed.
        shouldCreateUser: true,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <p className="max-w-sm text-center text-ink-muted" role="status">
        {t("checkEmail", { email })}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label htmlFor="email" className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted">
        {t("emailLabel")}
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        className="rounded-xs border border-ink-line bg-cream px-3 py-2 text-ink outline-none focus:border-celeste-deep"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xs border border-ink-line-strong bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-colors hover:bg-celeste-deep disabled:opacity-60"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
      {status === "error" && (
        <p className="text-sm text-rojo" role="alert">
          {t("error")}
        </p>
      )}
    </form>
  );
}
