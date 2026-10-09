# Project Context

## Current state
- Functional frontend scaffold is complete.
- Cart persists locally only as a convenience; authoritative order history is Supabase.
- Supabase schema and RLS policies are ready.
- Google OAuth is wired through Supabase Auth.
- Mailgun confirmation API is wired and validates the user's Supabase token.
- Vercel configuration and deployment README are ready.

## Human-only blockers
The following must be configured by the owner of the external accounts:
1. Supabase project URL and anon key.
2. Supabase Google provider credentials.
3. Google Cloud OAuth client and redirect URI.
4. Mailgun domain, API key and sender identity.
5. Vercel/GitHub access for deployment and source control.

## Next implementation step
Populate the production secrets/configuration, deploy to Vercel, then run the end-to-end HNG acceptance test.
