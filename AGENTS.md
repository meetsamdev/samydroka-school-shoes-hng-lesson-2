# Agent Instructions — Samydroka School Shoes

## Goal
Maintain a production-ready HNG Lesson 2 e-commerce demo with real authentication, database persistence and confirmation email.

## Non-negotiables
- Do not replace Supabase with localStorage for order persistence.
- Do not replace Google authentication with a fake login.
- Do not fake confirmation emails; Mailgun must send them in production.
- Never commit `.env`, API keys, service-role keys, or Mailgun private credentials.
- Preserve RLS and authenticated user ownership of orders.

## Acceptance criteria
Sign in works; users can add to cart; checkout creates an order in Supabase; confirmation email is delivered through Mailgun; users can reload/close/reopen and still retrieve their own orders after signing in again.

## Session handoff
At the end of a coding session update README.md with any integration/configuration changes and record unresolved deployment blockers here.
