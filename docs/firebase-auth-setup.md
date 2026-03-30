# Firebase Auth Setup For GitHub Pages

This site now uses Firebase Authentication for account registration and login, plus Cloud Firestore for private profile, order, and result records.

## Why this stack

- It works from a static GitHub Pages site with no server.
- Firebase Authentication supports email/password sign-up, sign-in, and password reset from the browser.
- As checked on March 30, 2026, Firebase pricing shows other Authentication services at no cost up to 50K monthly active users, and Cloud Firestore includes 1 GiB storage, 50K reads/day, 20K writes/day, and 20K deletes/day on the free tier.
- For a target of around 100 users, this is well inside the no-cost limits.

## Important constraint

GitHub Pages can only protect the user interface. It cannot safely hold private patient data as public static files.

That means:

- Public marketing pages can stay on GitHub Pages.
- Private profile, order, and result data must stay in Firestore behind security rules.
- Do not publish sensitive reports or JSON files directly into the repo or the generated site.

## Firebase console steps

1. Create a Firebase project.
2. Add a Web app inside the project.
3. In Authentication:
   - Enable `Email/Password`.
   - Optionally customize the password reset and verification email templates.
4. In Firestore Database:
   - Create the database in production mode.
   - Paste the rules from [firestore.rules](/c:/Users/Aditya/source/repos/healthapp-website-demo/docs/firestore.rules).
5. In Project settings:
   - Copy the Web app config values.
6. Update [auth-config.js](/c:/Users/Aditya/source/repos/healthapp-website-demo/scripts/auth-config.js):
   - Replace every `REPLACE_ME` value with the Firebase config from step 5.

## Recommended auth settings

- In Authentication > Settings > Authorized domains, add your live custom domain if it is not already listed.
- If your website uses a GoDaddy-managed domain, no hosting move is required. Keep GitHub Pages as the host and just point Firebase Auth at the same live domain for redirects and email links.
- If you want the auth emails to look more branded, configure the email templates in Firebase before going live.

## Firestore data layout used by the site

- `users/{uid}`
  - profile document with name, email, phone, timestamps
- `users/{uid}/orders/{orderId}`
  - private order records
- `users/{uid}/results/{orderId}`
  - private result records

## Deployment steps

1. Fill in [auth-config.js](/c:/Users/Aditya/source/repos/healthapp-website-demo/scripts/auth-config.js).
2. Commit the updated site.
3. Push to the branch GitHub Pages publishes from.
4. Open the live site and test:
   - register
   - sign in
   - password reset
   - checkout while signed in
   - orders page
   - results page

## Notes for production

- The current checkout flow is still a frontend demo. Real money capture should eventually move to a backend or serverless function you control.
- Email changes are not exposed in the profile page yet. Users change their login email through Firebase account flows, not through the profile form.
- Existing local demo orders/results still appear as a fallback on the same browser if cloud sync is unavailable.

## Official references

- Firebase pricing: https://firebase.google.com/pricing
- Password auth on the web: https://firebase.google.com/docs/auth/web/password-auth
- Password reset and user management: https://firebase.google.com/docs/auth/web/manage-users
