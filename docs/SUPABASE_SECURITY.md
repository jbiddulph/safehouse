# Supabase security notes (MySafeHouse)

## Are the Supabase URL and anon key in environment variables?

**Yes.** They are already loaded from environment variables — not hardcoded in the repository:

| Variable | Where set | Client-visible? |
|---|---|---|
| `SUPABASE_URL` | Netlify / local `.env` | Yes (by design) |
| `SUPABASE_ANON_KEY` | Netlify / local `.env` | Yes (by design) |
| `SUPABASE_SERVICE_ROLE_KEY` | Netlify / local `.env` | **No** — server only |

Wiring is in `nuxt.config.ts`:

- `runtimeConfig.public.supabaseUrl` ← `process.env.SUPABASE_URL`
- `runtimeConfig.public.supabaseKey` ← `process.env.SUPABASE_ANON_KEY`
- `runtimeConfig.supabaseServiceRoleKey` ← `process.env.SUPABASE_SERVICE_ROLE_KEY`
- `@nuxtjs/supabase` module `url` / `key` also read the same env vars

See `.env.example` for the required names.

## Why can I see the URL and anon key in the browser?

That is **normal for Supabase**, not a credential leak.

The browser needs the project URL and the **anonymous (public) key** to talk to Auth/PostgREST. Anyone can extract them from network traffic or page source. Protection comes from:

1. **Row Level Security (RLS)** on every table exposed to the API
2. Keeping the **service role key** server-side only (it bypasses RLS)
3. Not shipping debug/admin endpoints that use the service role without auth

## What still needs review

Before concluding that user records are protected, review RLS on all `safehouse_*` tables in the live Supabase project:

- Confirm RLS is **enabled** on each table
- Confirm policies restrict `anon` / `authenticated` appropriately (owner-only where needed)
- Avoid policies like `USING (true)` on sensitive tables (for example profiles with PII)
- Treat repo SQL scripts (`fix_rls*.sql`) as historical helpers — verify what is actually applied in production

Repo note: `fix_rls_for_public_access.sql` contains a **public read-all profiles** policy (`USING (true)`). That is unsafe for production PII and should not be applied without a strong reason.

## Related code hardening in this change set

Debug / test API routes that could expose configuration or data are blocked outside local development via `assertDebugEndpointAllowed()`:

- `/api/debug-env`
- `/api/debug-email`
- `/api/debug/profiles`
- `/api/debug/users`
- `/api/debug/access-codes/:propertyId`
- `/api/stripe/webhook-debug`
- `/api/test-email`
- `/api/test-qr`
