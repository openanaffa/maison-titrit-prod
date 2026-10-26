"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/** Render an article body from markdown with vintage typography. */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div
      className={cn(
        "font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/85",
        "[&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-3 dark:[&_h2]:text-cream",
        "[&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2 dark:[&_h3]:text-cream",
        "[&_p]:mt-4 [&_p]:mb-2",
        "[&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:ps-6 [&_li]:list-disc",
        "[&_blockquote]:border-s-2 [&_blockquote]:border-terracotta [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:text-ink-soft dark:[&_blockquote]:text-cream/70 [&_blockquote]:my-6",
        "[&_strong]:text-ink dark:[&_strong]:text-cream [&_strong]:font-semibold",
        "[&_a]:text-terracotta [&_a]:underline [&_a]:underline-offset-2",
      )}
    >
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
