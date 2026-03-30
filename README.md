# Ayuta Health Website Demo

Static marketing and demo website for Ayuta Health, hosted on GitHub Pages with a custom GoDaddy-managed domain.

The site now includes:

- public marketing pages
- email/password registration and login with Firebase Authentication
- private profile, orders, and results data in Cloud Firestore
- Stripe-based frontend checkout demo

## Current Stack

- Hosting: GitHub Pages
- Domain and DNS: GoDaddy
- Frontend: static HTML, CSS, JavaScript
- Auth: Firebase Authentication
- Private data: Cloud Firestore
- Payments UI: Stripe

For the current architecture, see [docs/architecture/current-website-architecture.md](docs/architecture/current-website-architecture.md).

## Prerequisites

- Git
- Node.js if you want to run a local static server
- A Firebase project
- A GitHub repository with GitHub Pages enabled
- A GoDaddy domain if you are using a custom live domain

## Local Preview

Opening `index.html` directly is enough for simple static checks, but the shared navigation and some browser flows work better through a local server.

Install a simple static server:

```powershell
npm install --global http-server
```

Run the site from the repo root:

```powershell
http-server -o
```

## Firebase Setup

1. Create a Firebase project.
2. Add a Web app in that project.
3. In Firebase Authentication:
   - enable `Email/Password`
   - optionally customize verification and password reset email templates
4. In Firestore Database:
   - create the database in production mode
   - apply the rules in [docs/firestore.rules](docs/firestore.rules)
5. In Firebase project settings:
   - copy the Web app config values
6. Update [scripts/auth-config.js](scripts/auth-config.js):
   - replace every `REPLACE_ME` value with the real Firebase config
7. In Firebase Authentication > Settings > Authorized domains:
   - add your live custom domain if it is not already present

Detailed setup notes are in [docs/firebase-auth-setup.md](docs/firebase-auth-setup.md).

## GitHub Pages Setup

1. Push the repository to GitHub.
2. In the repository settings, enable GitHub Pages for the branch you want to publish.
3. Confirm the site is reachable on the default GitHub Pages URL before switching the custom domain.
4. Keep the root [CNAME](CNAME) file aligned with the live domain.

## Custom Domain Setup

If the site is live through GoDaddy:

1. Point the domain DNS records at GitHub Pages.
2. Confirm the same live domain is listed in Firebase Authentication authorized domains.
3. Wait for DNS propagation.
4. Recheck the live site using the final public URL.

## Stripe Setup

The current checkout is still a frontend demo flow.

Before relying on live payments:

- replace any placeholder publishable key and client-secret wiring with your real Stripe setup
- move real payment-intent creation and payment confirmation behind a backend or serverless function you control

## Deployment Checklist

Before pushing to production, confirm:

1. [scripts/auth-config.js](scripts/auth-config.js) contains real Firebase values.
2. Firestore rules from [docs/firestore.rules](docs/firestore.rules) are applied.
3. GitHub Pages is enabled.
4. The `CNAME` file matches the live domain.
5. Firebase authorized domains include the live domain.
6. The live site can:
   - register
   - sign in
   - send password reset emails
   - save profile changes
   - complete the demo checkout while signed in
   - load orders
   - load results

## Data and Security Notes

- GitHub Pages cannot protect static files that are published with the site.
- Sensitive user data must stay in Firestore behind auth rules, not in repo files or public JSON.
- Local storage is only used for basket state and same-browser demo fallback data.

## Repository Notes

- Main entry point: [index.html](index.html)
- Auth config template: [scripts/auth-config.js](scripts/auth-config.js)
- Auth and Firestore integration: [scripts/firebase-auth.js](scripts/firebase-auth.js)
- Firestore rules: [docs/firestore.rules](docs/firestore.rules)
- Architecture doc: [docs/architecture/current-website-architecture.md](docs/architecture/current-website-architecture.md)

## References

- Firebase pricing: https://firebase.google.com/pricing
- Firebase password auth docs: https://firebase.google.com/docs/auth/web/password-auth
- Firebase user management docs: https://firebase.google.com/docs/auth/web/manage-users
