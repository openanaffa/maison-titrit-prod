# Browser API Support — Maison Titrit

Evaluate each API for Baseline status, security/privacy, feature detection, fallback, polyfill need, and documented decision before adoption.

| API | Potential use | Status | Decision |
|---|---|---|---|
| Web App Manifest | Install identity | Implemented | Keep; enhance (M7) |
| Service Worker | Offline + push | Implemented (custom) | Keep/evaluate Workbox (M8) |
| Notifications API | Browser notifications | Not implemented | Planned (M10) |
| Push API | Server-originated push | Not implemented | Planned (M10, requires VAPID + schema) |
| Background Sync | Deferred ops | Not implemented | Evaluate for queued ops (M9) |
| IndexedDB | Structured local persistence | Not implemented | Evaluate for offline cache metadata (M9) |
| Cache API | Static/public content | Used via SW | Keep |
| BroadcastChannel | Cross-tab comm | Not implemented | Evaluate for cart sync across tabs (M11) |
| Web Share API | Product/order sharing | Implemented (`product-purchase`) | Keep |
| Clipboard API | Copy links/refs | Implemented (`product-purchase`) | Keep |
| WebAuthn / Passkeys | Auth | Not implemented | Evaluate (M11); Supabase auth dependency |
| Credential Management | Login UX | Not implemented | Evaluate (M11) |
| View Transitions API | Navigation transitions | Not implemented | Evaluate (M11) |
| Popover API | Native popovers | Not implemented (Radix used) | Keep Radix; evaluate for simple cases |
| `<dialog>` element | Accessible dialogs | Not implemented (Radix used) | Keep Radix |
| File System Access API | Optional file workflows | Not implemented | Not needed (admin uses upload endpoints) |
| Media Queries | Device prefs/a11y | Used (Tailwind + matchMedia) | Keep; add forced-colors/prefers-contrast |
| `navigator.onLine` | Connectivity state | Not used | Planned (M9) |

Rule: do not adopt an API merely because it exists; require a concrete UX win and a documented fallback.