# PRD — Samydroka School Shoes

## Objective
Deliver a functional HNG Lesson 2 e-commerce experience for a real-world sibling business concept: Samydroka School Shoes.

## Users
Parents/guardians and students' caregivers who need dependable school footwear for primary and secondary students.

## Core flows
1. Browse products.
2. Add products to bag.
3. Sign in with Google.
4. Enter delivery details and checkout.
5. Persist order in Supabase.
6. Send formatted confirmation email via Mailgun.
7. Reload/close/reopen page.
8. Sign in again and retrieve previous orders.
9. Sign out.

## Stack
- Static HTML/CSS/JavaScript frontend
- Supabase Auth + Postgres
- Google OAuth via Google Cloud Console
- Mailgun email API through Vercel serverless function
- Vercel deployment

## Data model
`orders`: id, user_id, customer_email, phone, address, items, total, status, created_at.

## Security
Supabase RLS restricts orders to their owner. Mailgun secret remains server-side. The email endpoint validates the Supabase bearer token before sending.

## Out of scope for Lesson 2
Production payments, inventory management, admin dashboard, logistics API, coupon engine.

## Acceptance criteria
All HNG tests in README.md pass against the production deployment.
