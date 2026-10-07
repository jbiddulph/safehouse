# Security headers

## How important is this?

**Medium importance — defense in depth.**

Missing CSP / framing / referrer / permissions headers is not an immediate data-leak by itself (unlike weak RLS). They reduce the impact of XSS, clickjacking, and unwanted browser features. Worth adding for production, especially alongside analytics and payment redirects.

Already present on Netlify (confirmed on `mysafehouse.co.uk`):

- HTTPS
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`

## What this project now sets

Configured in both:

- `netlify.toml` → CDN/edge for all paths
- `nuxt.config.ts` → Nitro `routeRules['/**'].headers` for SSR/API responses

| Header | Value (summary) | Purpose |
|---|---|---|
| `Content-Security-Policy` | Restrict scripts/styles/connect/frames to self + required vendors | Mitigate XSS / unwanted third-party script |
| `X-Frame-Options` | `DENY` | Anti-clickjacking (legacy) |
| CSP `frame-ancestors` | `'none'` | Modern anti-framing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | Disable most powerful APIs; allow `geolocation=(self)` and `payment=(self)` | Limit browser feature abuse |

## CSP allowlist notes

Required third parties for current features:

- Google Tag Manager / Analytics
- Mapbox (maps, tiles, workers via `blob:`)
- Supabase (API + realtime websocket + storage images)
- Stripe Checkout / hooks / JS
- Google Places (server-proxied autocomplete still may need `maps.googleapis.com` if called from client later)

`'unsafe-inline'` is currently required for GTM/gtag inline snippets and Vue/Nuxt inline styles. A future hardening step is nonce/hash-based CSP to remove `'unsafe-inline'`.

## After deploy

Check response headers on https://mysafehouse.co.uk :

```bash
curl -sI https://mysafehouse.co.uk | rg -i 'content-security|x-frame|referrer|permissions|strict-transport|x-content-type'
```

Then smoke-test: homepage map, address search, login, payments redirect, GTM/network tab for blocked resources.
