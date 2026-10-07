# MySafeHouse documentation

- [MySafeHouse User & Admin Guide (PDF)](./MySafeHouse-User-Admin-Guide.pdf) — product overview, how to use the website, and Admin Panel reference.
- [Supabase security notes](./SUPABASE_SECURITY.md) — env vars for URL/anon key, why they appear in the browser, and RLS review guidance.
- [Security headers](./SECURITY_HEADERS.md) — CSP, anti-framing, referrer, and permissions policies.
- [Mapping API keys](./MAP_API_KEYS.md) — Google/Mapbox visibility, domain/API restrictions, quotas.

To regenerate the PDF:

```bash
python3 docs/generate_user_admin_guide.py
```
