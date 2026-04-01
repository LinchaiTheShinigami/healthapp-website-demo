Keep changes aligned with the live Ayuta website architecture:

- Treat the repo as a static GitHub Pages frontend first. Prefer hosted or serverless integrations over browser-only secrets.
- For payments, do not imply that a browser redirect proves payment succeeded. Use pending language until a webhook or server-side verification exists.
- Review files before staging and keep commits atomic enough to roll back a single concern.
- Update docs and `tasks.md` when an implementation is intentionally temporary or when a safer follow-up is known.
- Preserve the public-repo posture: commit browser-safe config only, never service-account keys or Stripe secret keys.
