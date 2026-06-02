# Quién Gana

**A public-accountability platform built by Boricuas Antifascistas.** It documents, in public and bilingually (Español / English), the colonial circuits moving wealth out of Puerto Rico — pensions, Act 60 settlers, the privatized grid, the fiscal control board, disaster contractors, pharma, and displacement.

> Public record only. Every claim sources to documents anyone can verify.

## Status

Pre-Phase-1 scaffold. See [`SPEC.md`](./SPEC.md) for the full specification and [`CLAUDE.md`](./CLAUDE.md) for build conventions.

## Stack

Next.js 15 (App Router) · TypeScript · Supabase (Postgres) · Drizzle · Tailwind v4 · shadcn/ui · next-intl · Inngest · MapLibre. Full rationale in `SPEC.md §2`.

## Getting started

> Not yet runnable — Phase 1 has not been built. Once it is:

```bash
cp .env.example .env.local   # fill in values
npm install
supabase start              # local Postgres + auth
npm run dev                 # http://localhost:3000 → /es
```

## Layout

- `SPEC.md` — canonical specification (stable section numbers)
- `CLAUDE.md` — conventions for the building agent
- `src/` — app, jobs, admin (single Next.js codebase)
- `drizzle/` — SQL migrations
- `docs/` — methodology, moderation policy, data sources, incident response

## A note on git

This repo uses a dedicated Boricuas Antifascistas commit identity, kept separate from any personal or commercial identity. Commits are blocked by a pre-commit hook until that identity is configured. See `CLAUDE.md §1`.
