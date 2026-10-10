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

## ## 1. Local setup

### Requirements
- Node.js 22 or later
- Git
- A Supabase project
- A Google OAuth web client configured through Google Cloud Console
- A Mailgun sending domain or sandbox domain
- A Vercel account

### Installation
1. Clone this repository or download the project source.
2. Open a terminal in the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure the environment variables described below.
5. Start the local development server:

   ```bash
   npx vercel dev
   ```

6. Open `http://localhost:3000`.

### Environment variables

Create a local `.env.local` file containing these variable names and your own values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_FROM`

The Supabase URL and publishable key must also be configured in `js/config.js` for the browser application. Never put a Supabase service-role key or Mailgun private sending key in frontend code.

Do not commit `.env.local` or any file containing actual secrets.

### Live application

- Production website: https://samydroka-school-shoes-hng-lesson-2.vercel.app
- Source repository: https://github.com/meetsamdev/samydroka-school-shoes-hng-lesson-2

### Verified acceptance tests

- Google authentication works on the deployed site.
- Orders are saved to Supabase.
- Previous orders remain visible after refresh and after signing out and back in.
- A production checkout successfully sends a confirmation email through Mailgun.
- The production site loads in a browser without requiring Vercel account authentication.

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
