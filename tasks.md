# Tasks

## Payments

- [x] Replace the browser-only Stripe mock with hosted Stripe Payment Links for the GitHub Pages site.
- [ ] Replace hosted Stripe Payment Links with a server-backed Stripe implementation.
- [x] Align the Foundation / Performance / Elite tier mapping to the Sussex Pathology PDF package basis.
- [ ] Create Checkout Sessions server-side from Firebase so pricing and the order reference are generated per order.
- [ ] Add a Stripe webhook that marks Firestore orders as paid only after Stripe confirms payment.
- [ ] Re-enable automatic results unlock only after webhook-confirmed payment.
- [ ] Support multi-item carts again once Checkout Sessions are generated dynamically.

## Operations

- [ ] Configure Stripe Payment Links for all six package and collection variants, then set the after-payment redirect to `/pages/payment-return.html`.

## Partnership Form

- [ ] **Wire Apps Script URL** — `apps-script/partnership-enquiry.gs` is deployed but `PARTNERSHIP_APPS_SCRIPT_URL` in `scripts/partnership-page.js` still contains the placeholder. Prerequisites: (1) enable 2-Step Verification on the Google account at https://myaccount.google.com/security, (2) deploy the script as a Web App (Execute as: Me, Anyone can access), (3) paste the generated URL into the constant.
- [ ] **Switch notification email** — Replace `ayuta.info@gmail.com` with `partnerships@ayuta.co.uk` in `apps-script/partnership-enquiry.gs` once GoDaddy email routing is configured for that address.

## Profile

- [ ] **Phone number ISO ambiguity** — `splitPhone()` maps `+1` → `US` and `+7` → `RU`, but multiple countries share those prefixes (Canada, Jamaica, etc. for `+1`; Kazakhstan for `+7`). A user who selects Canada will have their number stored as `+1 …` and reloaded with the US flag. Fix: persist the selected ISO code as a separate field in the Firestore profile document (e.g. `phoneIso: "CA"`), then use it directly in `resetFormValues` rather than parsing from the prefix. Requires a Firestore profile schema update and a `saveProfile` change to write `phoneIso` alongside `phone`.



- [ ] **A02 Cryptographic / Credential Exposure** — Firebase API key is committed to `scripts/auth-config.js` and publicly visible. This is expected for client-side Firebase (the key is restricted by Firebase security rules and authorised domain settings). Confirm that authorised domains in Firebase console are locked to `ayuta.co.uk` only before going live.
- [ ] **A03 Injection (XSS)** — `scripts/include-nav.js` sets `innerHTML` from a fetched snippet file (`navPlaceholder.innerHTML = data`). The fetch is same-origin (GitHub Pages static file) so risk is low in the current setup. If the nav snippet source ever changes to an external CDN, sanitise the response with DOMParser before inserting.
- [ ] **A05 Security Misconfiguration — No Content-Security-Policy** — GitHub Pages does not support custom HTTP headers, so a server-side CSP cannot be set. A `<meta http-equiv="Content-Security-Policy">` tag may be added as a partial mitigation but must be tested against Firebase and payment scripts. Track for the move to a server-backed deployment.
- [ ] **A05 Security Misconfiguration — No Subresource Integrity on payment redirect** — Stripe Payment Link redirects are controlled client-side in `stripe-payment-links-config.js`. Before going live, verify all six Payment Link URLs are production links and not test-mode links.
- [ ] **A07 Identification and Authentication** — Stripe test-mode Payment Links (`test_` prefix) are active on the live domain. Replace with production Stripe Payment Links before accepting real payments.
- [ ] **A09 Logging and Monitoring** — No client-side error reporting is in place. Add structured error logging (e.g. Firebase Crashlytics or a lightweight error boundary) to surface authentication or checkout failures before moving to production.
