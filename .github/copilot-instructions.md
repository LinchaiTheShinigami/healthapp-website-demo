# Copilot Instructions

This repository uses centralized instructions, skills, and tools.

For the master index, see the `playbook` repository (personal dev setup — paths are specific to the primary developer's machine):
`c:\Users\Aditya\source\repos\playbook\.github\copilot-instructions.md`

For repo-specific prompts and skills, see:
`c:\Users\Aditya\source\repos\playbook\specialized\healthapp-website-demo\`

---

## Repo Instructions (inline — apply to all work in this repo)

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
- GitHub CLI (`gh`) and PowerShell: never pass multi-line or backtick-formatted text via `--body "..."` in PowerShell — backticks are PowerShell escape characters. Always write the body to a UTF-8 no-BOM temp file and use `--body-file`.
- GitHub CLI duplicate comment risk: if a `gh api` comment POST appears to fail or produce no visible output in PowerShell, verify on GitHub before retrying — the request may have succeeded silently, and retrying will create duplicates.
- Order tracker `STATUS_STEP` map: every key must be the **active step index** for that status. Verify with `output/playwright/diag-payment-return.mjs`.
- Stripe Payment Links (`buy.stripe.com`, `book.stripe.com`) only accept UTM params, `client_reference_id`, `prefilled_email`, and `locale` as query parameters. All other query params are silently dropped — do not append `return_url` or custom redirect params to Payment Link URLs.
- Pushing to an active PR: the `pre-push` git hook (`.git/hooks/pre-push`) auto-posts a commit summary comment on the open PR whenever `gh` CLI is available.
- bfcache back-navigation: any CSS class added to `<body>` for a page-exit animation (e.g. `is-navigating-away`) will still be present when the browser restores the page from the bfcache on back-navigation, leaving the page frozen and unclickable. Always pair such classes with a `window.addEventListener('pageshow', e => { if (e.persisted) { document.body.classList.remove('...'); } })` handler. See `scripts/nav-state.js` `bindPageTransitions`. To force a synchronous CSS reflow after removing the class (so Chrome repaints immediately), call `element.getBoundingClientRect()` — do NOT use `void element.offsetWidth`, which SonarCloud flags as CRITICAL (S3735 "Remove this use of the void operator").
- SonarCloud conventions (rules active on this repo): use `globalThis` instead of `window` (S7764); use `const`/`let` instead of `var` (S3504); never use the `void` operator (S3735) — replace `void expr` with a named call if a side-effect is needed.
