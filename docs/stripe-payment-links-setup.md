# Stripe Payment Links Setup

This repo now uses fixed Stripe Payment Links as the initial static-site payment flow.

## Current Model

- The order page stores a pending order in local storage and Firestore.
- The customer is redirected to a Stripe-hosted payment page.
- Payment is **not** verified in the browser.
- The return page is informational only.
- The current Foundation / Performance / Elite tiers are Ayuta bundles built from the Sussex Pathology B2B menu.

This is intentionally a demo-safe bridge until the Firebase-backed Stripe implementation is added.

The package basis is documented in [docs/package-basis.md](package-basis.md).

## What To Create In Stripe

Create one Payment Link for each package and collection variant:

- `foundation` / `home`
- `foundation` / `lab`
- `performance` / `home`
- `performance` / `lab`
- `elite` / `home`
- `elite` / `lab`

Use the same GBP prices shown in the order page.

## Repo Config

1. Open [scripts/stripe-payment-links-config.js](../scripts/stripe-payment-links-config.js).
2. Replace every `REPLACE_ME_...` value with the real Stripe Payment Link URL.
3. Keep the `afterPaymentReturnUrl` value aligned with your live domain.

## Stripe Dashboard Settings

For each Payment Link:

1. Set the product/price in Stripe.
2. Enable the payment methods you want to offer.
3. In the after-payment settings, redirect customers back to:

```text
https://ayuta.co.uk/pages/payment-return.html
```

If you also test on another domain, update the return URL accordingly.

## Important Constraint

Payment Links are fixed hosted links, so this version of the checkout:

- supports one selected package at a time
- does not verify payment in-browser
- does not automatically unlock results
- does not support dynamic carts or per-order metadata safely

That future work is tracked in [tasks.md](../tasks.md).
