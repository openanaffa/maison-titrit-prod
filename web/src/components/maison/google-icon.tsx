/**
 * Official multi-color Google "G" mark for the Continue with Google button.
 * Inline SVG (brand colors hardcoded per Google's usage guidelines) — lucide
 * has no brand icons, and emoji icons are an anti-pattern.
 */
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M23.766 12.276c0-.816-.066-1.6-.19-2.352H12.24v4.451h6.484a5.54 5.54 0 0 1-2.396 3.63v3.025h3.875c2.266-2.086 3.563-5.16 3.563-8.754Z"
      />
      <path
        fill="#34A853"
        d="M12.24 24c3.24 0 5.964-1.075 7.952-2.91l-3.875-3.025c-1.075.72-2.452 1.146-4.077 1.146-3.13 0-5.782-2.114-6.728-4.964H1.556v3.118A12.001 12.001 0 0 0 12.24 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.512 14.247A7.213 7.213 0 0 1 5.137 12c0-.78.134-1.537.375-2.247V6.635H1.556A12.001 12.001 0 0 0 .24 12c0 1.936.463 3.77 1.316 5.365l3.956-3.118Z"
      />
      <path
        fill="#EA4335"
        d="M12.24 4.789c1.768 0 3.353.61 4.603 1.806l3.452-3.452C18.196 1.185 15.472 0 12.24 0A12.001 12.001 0 0 0 1.556 6.635l3.956 3.118c.946-2.85 3.598-4.964 6.728-4.964Z"
      />
    </svg>
  );
}
