# Samydroka School Shoes — HNG Lesson 2

A functional e-commerce shop built to satisfy the Lesson 2 integration requirements:

- Product/shop experience
- Responsive storefront with product search and school-level category filters
- Persistent shopping bag for returning visitors
- Add-to-cart
- Checkout
- Persistent Supabase database
- Google authentication through Supabase Auth + Google Cloud OAuth credentials
- Real confirmation emails through Mailgun
- Persistent order history after logout/reload/re-login
- Vercel-ready deployment

## Important assumption
The shop concept is **Samydroka School Shoes**, based on the user's sibling's footwear business and its current focus on primary/secondary school shoes. Product names/prices are demo catalog data and can be replaced before submission.

## 1. Local setup

1. Install Node.js 22+.
2. Install the Vercel CLI: `npm install`.
3. Copy `.env.example` to `.env.local` and fill the server values.
4. Put the Supabase URL + anon key into `js/config.js` (these two values are safe for browser use; do not put service-role keys there).
5. Run `npm run dev`.

## 2. Supabase

Create a Supabase project, open SQL Editor, and run `supabase/schema.sql`.

Then enable Google under Authentication > Providers > Google.

## 3. Google Cloud

Create/configure a Google OAuth 2.0 Web Client in Google Cloud Console. Add the Supabase callback URL shown by Supabase to the authorized redirect URIs. Also add the deployed site URL to the allowed origins as appropriate.

## 4. Mailgun

Create/verify a Mailgun sending domain. Set:

- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_FROM`

Never expose the Mailgun private API key in frontend code.

## 5. Vercel

Import this folder/repository into Vercel. Add the production environment variables from `.env.local`. After deployment, update the Supabase URL configuration and Google OAuth redirect/origin settings to the production URL.

## 6. HNG acceptance test

1. Open production URL.
2. Sign in with Google.
3. Add product(s) to bag.
4. Checkout with a test delivery phone/address.
5. Confirm the order appears under My Orders.
6. Confirm a real Mailgun email arrives.
7. Close/reopen the page.
8. Sign in again.
9. Confirm the previous order remains visible.
10. Test logout and sign-in again.

## Security notes

- Only the Supabase anon key is used in browser code.
- Order RLS limits reads/inserts to the authenticated user's own `user_id`.
- Mailgun credentials remain server-side.
- The confirmation API verifies the Supabase access token before sending email.
