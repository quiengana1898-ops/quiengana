import type { ReactNode } from "react";

// Shared rich-text tag map for next-intl t.rich(). Tags are unstyled here;
// emphasis color/italics are applied by the parent via Tailwind variants
// (e.g. [&_em]:text-rojo) so the same copy adapts per section.
export const richTags = {
  em: (chunks: ReactNode) => <em>{chunks}</em>,
  strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
};
