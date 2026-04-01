# Current Website Architecture

This document shows the current basic architecture of the Ayuta demo website after the login and registration changes.

## Summary

- Public site hosting: GitHub Pages
- Custom domain: GoDaddy-managed DNS pointing to GitHub Pages
- Frontend: static HTML, CSS, and JavaScript
- Authentication: Firebase Authentication
- Private user data: Cloud Firestore
- Payments: fixed Stripe Payment Links demo flow
- Browser-only temporary state: local storage for basket and demo fallback data

## High-Level Diagram

```mermaid
flowchart LR
  User[User Browser]

  subgraph Delivery
    DNS[GoDaddy DNS / Custom Domain]
    Pages[GitHub Pages]
  end

  subgraph Frontend
    UI[Static HTML/CSS/JS]
    Local[(Local Storage)]
  end

  subgraph Firebase
    Auth[Firebase Auth]
    DB[(Cloud Firestore)]
  end

  Stripe[Stripe Payment Links]

  User --> DNS
  DNS --> Pages
  Pages --> UI

  UI --> Auth
  UI --> DB
  UI --> Stripe
  UI --> Local

  Auth --> DB
```

## What Lives Where

### Public

- Landing page
- About page
- Contact page
- Static assets and frontend code

These are delivered from GitHub Pages and are public by design.

### Protected By Login

- Profile page
- Orders page
- Results page

These pages are still served as static HTML, but the private content is only loaded after Firebase confirms the user identity.

## Request and Data Flow

1. A visitor opens the site through the custom domain.
2. GoDaddy DNS points the domain to GitHub Pages.
3. GitHub Pages serves the static frontend.
4. The frontend opens login and registration flows through Firebase Authentication.
5. After sign-in, the frontend reads and writes the signed-in user's profile, orders, and results in Firestore.
6. When the customer continues to payment, the frontend stores a pending order record and redirects to a fixed Stripe Payment Link.
7. The orders page shows the pending order record for the authenticated user, while results remain locked until payment is confirmed outside the browser.
8. Local storage still keeps non-sensitive browser state such as basket progress and local fallback demo data.

## Firestore Structure

```text
users/{uid}
users/{uid}/orders/{orderId}
users/{uid}/results/{orderId}
```

## Important Constraints

- GitHub Pages cannot truly secure files placed directly in the website output.
- Sensitive user data must stay in Firestore behind security rules, not in static JSON or HTML files.
- Fixed Stripe Payment Links avoid a custom backend for the first demo, but they do not verify payment inside the site.
- Real payment confirmation should move behind Firebase-hosted serverless logic plus Stripe webhooks in a later iteration.

## Current Responsibility Split

- GitHub Pages: static hosting only
- GoDaddy: domain and DNS only
- Firebase Auth: registration, sign-in, password reset, session state
- Firestore: per-user private records
- Stripe Payment Links: hosted checkout pages for the demo flow
- Frontend JS: page gating, pending-order capture, and client-side state
