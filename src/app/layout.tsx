import type { ReactNode } from "react";

// The real <html>/<body> shell lives in app/[locale]/layout.tsx (next-intl
// App Router pattern). This root layout is a required passthrough.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
