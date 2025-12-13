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

### Option A: Redirect All Traffic to Holding Page (Recommended)

Edit `netlify.toml` and uncomment/update the redirect rules:

```toml
[[redirects]]
  from = "https://your-parked-domain.com/*"
  to = "/coming-soon"
  status = 200
  force = true

[[redirects]]
  from = "https://www.your-parked-domain.com/*"
  to = "/coming-soon"
  status = 200
  force = true
```

Replace `your-parked-domain.com` with your actual domain.

### Option B: Use Domain-Specific Routing (Advanced)

If you want to show the holding page only for the parked domain while keeping the main app on the Netlify subdomain:

1. Create a middleware that checks the domain
2. Or use Netlify's branch-based routing

## Step 3: Deploy

After updating `netlify.toml`:

1. Commit and push your changes
2. Netlify will automatically redeploy
3. Your parked domain will show the coming soon page

## Step 4: Verify

1. Visit your parked domain (e.g., `https://yourdomain.com`)
2. You should see the "Coming Soon" page
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

1. Remove or comment out the redirect rules in `netlify.toml`
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


