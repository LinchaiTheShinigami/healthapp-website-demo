# Tasks

## Payments

- [x] Replace the browser-only Stripe mock with fixed Stripe Payment Links for the GitHub Pages demo.
- [ ] Replace fixed Stripe Payment Links with a Firebase-backed Stripe implementation.
- [x] Align the Foundation / Performance / Elite tier mapping to the Sussex Pathology PDF package basis.
- [ ] Create Checkout Sessions server-side from Firebase so pricing and the order reference are generated per order.
- [ ] Add a Stripe webhook that marks Firestore orders as paid only after Stripe confirms payment.
- [ ] Re-enable automatic results unlock only after webhook-confirmed payment.
- [ ] Support multi-item carts again once Checkout Sessions are generated dynamically.

## Operations

- [ ] Configure Stripe Payment Links for all six package and collection variants, then set the after-payment redirect to `/pages/payment-return.html`.
