# Mapping API keys (Google & Mapbox)

## How important is this?

**Medium–high for cost control; medium for security.**

Browser-visible keys are often unavoidable for map SDKs. The risk is mainly **quota abuse and unexpected billing**, not direct access to your database. Mitigate with **domain/API restrictions**, **quotas/budgets**, and keeping server-only keys off the client.

## Current MySafeHouse setup

| Key (env) | Used for | Exposed to browser? | Correct pattern |
|---|---|---|---|
| `GOOGLE_API` | Places autocomplete via `/api/address-autocomplete` | **No** (server-only `runtimeConfig.googleApiKey`) | Restrict APIs + quotas; prefer separate server key |
| `MAPBOX_API` | Mapbox GL maps, reverse geocode, static map URLs | **Yes** (`runtimeConfig.public.mapboxApiKey`) | Expected for Mapbox GL — restrict by URL in Mapbox |

Code change: `GOOGLE_API` is **no longer** mirrored into `runtimeConfig.public` (it was unused on the client; Places calls already go through the server).

## Checklist — Google Cloud (Places)

Do this in [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials):

1. **Use a dedicated key** for MySafeHouse Places (don’t share with unrelated projects).
2. **API restrictions** — allow only what you need, e.g.:
   - Places API (and/or Places API (New) if migrated)
   - Do **not** leave “Don’t restrict key” enabled in production
3. **Application restrictions**
   - Because calls are made from **Netlify Functions** (server), HTTP referrer restrictions are a poor fit.
   - Prefer **API restriction + quotas** (Netlify egress IPs are dynamic, so IP allowlists are hard).
4. **Quotas & budgets**
   - Set per-day request quotas on Places
   - Create a billing budget alert (e.g. email at 50% / 90% / 100%)
5. **Rotate** the key if it was previously published in client bundles.

## Checklist — Mapbox

Do this in [Mapbox Account → Access tokens](https://account.mapbox.com/access-tokens/):

1. Use a **public token** for the website (this is what `MAPBOX_API` should be).
2. **URL restrictions** — allow only:
   - `https://mysafehouse.co.uk/*`
   - `https://www.mysafehouse.co.uk/*` (if used)
   - Netlify preview URLs if needed: `https://*.netlify.app/*`
   - Local dev if needed: `http://localhost:3000/*`
3. **Scopes** — keep default public scopes; do **not** put a secret token in the browser.
4. **Usage** — monitor Account → Statistics; set email alerts if available on your plan.
5. Optional hardening later: proxy reverse-geocode/static-map calls through a Nuxt API so fewer token uses appear in raw network URLs (Mapbox GL still needs a browser token for tiles).

## App-side controls already in place

- Google Places is reached only through `/api/address-autocomplete` (key stays on the server).
- That endpoint enforces min length, max length, and a best-effort per-IP rate limit (30/min).
- Mapbox token is read from env (`MAPBOX_API`) — never hardcode tokens in git.

## After changing restrictions

Smoke-test:

1. Dashboard / property forms: address autocomplete still works
2. Homepage / property page: Mapbox map tiles load
3. From a disallowed origin (or curl with a stolen Mapbox token from another domain), requests should fail once URL restrictions are active
