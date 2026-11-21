# Browser Verification — Maison Titrit

> How to use Chrome DevTools for agents with the Maison Titrit repo.

## 1. Configuration

`chrome-devtools-mcp` is registered in `opencode.json` (and `.cursor/mcp.json`, `.kiro/settings/mcp.json`) as `chrome-devtools`:

```json
{
  "type": "local",
  "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--isolated", "--no-usage-statistics"],
  "enabled": true
}
```

- `--isolated`: uses a temporary profile; never touches your personal Chrome data.
- `--no-usage-stats`: opts out of telemetry.
- Chrome must be installed (`C:\Program Files\Google\Chrome\Application\chrome.exe` on Windows).

## 2. Usage principles

- Use Chrome DevTools for **live inspection**: console, network, performance traces, screenshots, DOM.
- Use Playwright for **repeatable functional tests**.
- Use Lighthouse for **performance budgets**.
- Neither DevTools nor MWG replaces Playwright/Lighthouse/Biome/ESLint.

## 3. Recommended verification workflows

### A. Accessibility

- Keyboard navigation & focus management (tab order, focus rings).
- Semantic HTML & ARIA correctness.
- Form validation & error announcements (`role="alert"`, `aria-live`).
- Contrast & touch targets (≥44px).
- Reduced-motion (`prefers-reduced-motion`).
- Arabic RTL (`dir="rtl"`).
- Dialog/popover focus trap & restore.

### B. Performance

- LCP image prioritization (`priority`/`fetchPriority`).
- INP & long main-thread tasks.
- CLS & image dimensions.
- Responsive image delivery.
- JS execution & unnecessary hydration.
- Mobile / constrained CPU+network.

### C. Functional

- Product discovery & filtering.
- Product detail & variant selection.
- Cart & checkout (COD).
- Order confirmation.
- Customer account workflows.
- `/makteb` auth & RBAC.
- FR/AR/EN rendering & RTL layout.

## 4. Security considerations

- `--isolated` ensures no personal authenticated profile is exposed.
- Never commit browser profiles or session data.
- Do not run DevTools MCP in CI or production without a demonstrated requirement.
- DevTools MCP is local-only by configuration.

## 5. Starting the tool

Restart your agent client after config changes. The server launches Chrome on demand. No additional setup beyond Chrome installation.