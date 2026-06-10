import { redirect } from "next/navigation";
import Link from "next/link";

import { getSessionUser, getUserRole } from "@/lib/auth";

import "../globals.css";

export const metadata = { title: "Quién Gana — Admin" };

// /admin is non-localized and lives outside [locale], so it renders its own
// <html>/<body> shell (the root layout is a passthrough).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/en/entrar");
  const role = await getUserRole(user.id);
  const authorized = role === "moderator" || role === "admin";

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-cream-deep text-ink">
        {authorized ? (
          <>
            <header className="border-b border-ink-line bg-ink text-cream">
              <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-3">
                <div className="flex items-center gap-6">
                  <Link href="/admin" className="font-display text-lg italic text-cream no-underline">
                    Quién Gana <span className="text-celeste">admin</span>
                  </Link>
                  <nav className="flex gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-cream/70">
                    <Link href="/admin" className="no-underline hover:text-celeste">Dashboard</Link>
                    <Link href="/admin/staging" className="no-underline hover:text-celeste">Staging</Link>
                  </nav>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-cream/60">
                  <span>{user.email} · {role}</span>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="cursor-pointer uppercase tracking-[0.12em] text-cream/70 hover:text-rojo">
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </header>
            <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-8">
              {children}
            </main>
          </>
        ) : (
          <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <h1 className="font-display text-2xl font-medium">Not authorized</h1>
            <p className="text-ink-muted">
              This area is for moderators and admins. You&apos;re signed in as{" "}
              <span className="font-mono text-sm">{user.email}</span> ({role ?? "no role"}).
            </p>
            <form action="/auth/signout" method="post">
              <button type="submit" className="cursor-pointer rounded-xs border border-ink-line-strong px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-cream">
                Sign out
              </button>
            </form>
          </main>
        )}
      </body>
    </html>
  );
}
