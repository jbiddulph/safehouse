# Domain Parking Setup Guide

## Overview
This guide shows you how to park a domain at a holding/coming soon page on your Netlify app.

## Step 1: Add Domain to Netlify

1. Go to **Netlify Dashboard** → Your Site → **Domain settings**
2. Click **Add custom domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow Netlify's DNS configuration instructions:
   - Add the DNS records Netlify provides to your domain registrar
   - Wait for DNS propagation (can take up to 48 hours, usually much faster)

## Step 2: Configure Redirects

**Important:** Netlify redirects in `netlify.toml` don't support domain matching. We use server middleware instead.

The domain parking is handled by `server/middleware/domain-parking.ts`, which automatically redirects parked domains to `/coming-soon` while keeping your main Netlify domain working normally.

To add or modify parked domains, edit `server/middleware/domain-parking.ts`:

```typescript
const parkedDomains = [
  'mysafehouse.co.uk',
  'www.mysafehouse.co.uk'
]
```

Add your domain(s) to this array. The middleware will automatically redirect all traffic from these domains to `/coming-soon`.

## Step 3: Deploy

After updating `netlify.toml`:

1. Commit and push your changes
2. Netlify will automatically redeploy
3. Your parked domain will show the coming soon page

## Step 4: SSL Certificate (Important!)

After adding your domain to Netlify:

1. **DNS verification** will complete first (usually within minutes)
2. **SSL/TLS certificate provisioning** can take up to 24 hours
3. During this time, you may see "Your connection to this site is not secure" - this is normal
4. Once the certificate is issued, you'll see a green padlock and HTTPS will work

**To check SSL status:**
- Go to Netlify Dashboard → Your Site → **Domain settings**
- Look for "SSL/TLS certificate" section
- Status will show "Provisioning" until complete

**Note:** You can still test the redirects during certificate provisioning, but you'll need to accept the security warning in your browser.

## Step 5: Verify

1. Visit your parked domain (e.g., `https://mysafehouse.co.uk` or `http://mysafehouse.co.uk` during SSL provisioning)
2. You should be automatically redirected to the "Coming Soon" page
3. The main app should still work on `https://safehouse2025.netlify.app`

## Customizing the Holding Page

Edit `app/pages/coming-soon.vue` to customize:
- Text content
- Colors/styling
- Contact information
- Logo
- Add email signup form (optional)

## When Ready to Launch

When you're ready to use the domain for the full app:

1. Remove your domain from the `parkedDomains` array in `server/middleware/domain-parking.ts`
2. Redeploy
3. Your domain will now show the full SafeHouse application

## Alternative: Subdomain Parking

If you want to park the domain but keep the main app accessible:

- Park `www.yourdomain.com` → Coming soon page
- Keep `yourdomain.com` → Full app (or vice versa)

Just adjust the redirect rules accordingly.

## Notes

- DNS propagation can take time (usually 1-24 hours)
- SSL certificate will be automatically provisioned by Netlify
- The holding page is accessible at `/coming-soon` on any domain
- You can test it locally by visiting `http://localhost:3000/coming-soon`


