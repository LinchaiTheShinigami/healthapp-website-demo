Keep changes aligned with the live Ayuta website architecture:

- Treat the repo as a static GitHub Pages frontend first. Prefer hosted or serverless integrations over browser-only secrets.
- For payments, do not imply that a browser redirect proves payment succeeded. Use pending language until a webhook or server-side verification exists.
- Review files before staging and keep commits atomic enough to roll back a single concern.
- Update docs and `tasks.md` when an implementation is intentionally temporary or when a safer follow-up is known.
- Preserve the public-repo posture: commit browser-safe config only, never service-account keys or Stripe secret keys.
- Leaflet.js: SRI hashes must match the exact CDN build. The verified hashes for `leaflet@1.9.4` are: CSS `sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=`, JS `sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=`. A wrong hash silently blocks the script — browser DevTools network tab shows `net::ERR_BLOCKED_BY_SRI`.
- Leaflet popups: never set `overflow: hidden` on the map wrapper element — it clips popup bubbles. Set it only on the inner map canvas element (which clips tile corners safely).
- Playwright diagnostics: run `node output/playwright/diag-*.mjs` to verify page state after any non-trivial change. Do not assume code works without a verification run. The dev server must be running on `127.0.0.1:8080` before running diagnostics.
- Google Apps Script forms: the deploying Google account must have 2-Step Verification enabled before the "Execute as: Me" authorisation flow will succeed.
- GitHub CLI (`gh`) and PowerShell: never pass multi-line or backtick-formatted text via `--body "..."` in PowerShell — backticks are PowerShell escape characters (`` `f `` → form-feed, `` `a `` → BEL, etc.), which garbles inline code and em-dashes. Always use `--input <path-to-json-file>` where the JSON file contains the `{"body": "..."}` payload. This applies to `gh pr create`, `gh pr edit`, `gh api --method PATCH pulls/N`, and reply endpoints.
- GitHub CLI duplicate comment risk: if a `gh api` comment POST appears to fail or produce no visible output in PowerShell, verify on GitHub before retrying — the request may have succeeded silently, and retrying will create duplicates that must be manually deleted via `gh api --method DELETE`.
