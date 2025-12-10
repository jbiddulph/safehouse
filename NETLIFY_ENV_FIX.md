# Fixing Netlify 4KB Environment Variable Limit

## Problem
Netlify bundles ALL environment variables into Lambda functions, which has a 4KB limit. Large variables can easily exceed this.

## Solution: Remove Unnecessary Variables

### Step 1: Remove DATABASE_URL from Netlify
**`DATABASE_URL` is NOT needed in Netlify** - it's only used for:
- Prisma migrations (run locally or in CI)
- Prisma generate (happens at build time)

Since you're using Supabase, you don't need `DATABASE_URL` in Netlify environment variables. Remove it from:
- Netlify Dashboard → Site Settings → Environment Variables

### Step 2: Remove All Firebase Variables
If you haven't already, remove ALL Firebase-related variables:
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `FIREBASE_SA_*` (all split variables)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_VAPID_KEY`

### Step 3: Keep Only Required Variables
Keep these in Netlify (they're needed at runtime):
- `BASE_URL` (or `NETLIFY_URL` - auto-set by Netlify)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET` (if using webhooks)
- `GOOGLE_API` (if using Google services)
- `MAPBOX_API` (if using Mapbox)
- `MAILTRAP_USERNAME` (optional, for email)
- `MAILTRAP_PASSWORD` (optional, for email)

### Step 4: Check Variable Sizes
In Netlify Dashboard, ensure:
- No extra whitespace in values
- No newlines in values
- No duplicate variables
- No unused variables

### Step 5: Typical Variable Sizes
- `BASE_URL`: ~50 bytes
- `SUPABASE_URL`: ~100 bytes
- `SUPABASE_ANON_KEY`: ~200 bytes
- `SUPABASE_SERVICE_ROLE_KEY`: ~200 bytes
- `STRIPE_SECRET_KEY`: ~100 bytes
- `STRIPE_PUBLISHABLE_KEY`: ~100 bytes
- `GOOGLE_API`: ~50 bytes
- `MAPBOX_API`: ~50 bytes
- `MAILTRAP_USERNAME`: ~50 bytes
- `MAILTRAP_PASSWORD`: ~50 bytes

**Total should be well under 4KB (4096 bytes)**

## Quick Action Items

1. ✅ Go to Netlify Dashboard → Site Settings → Environment Variables
2. ✅ **DELETE `DATABASE_URL`** (not needed for runtime)
3. ✅ **DELETE all Firebase variables** (if not already done)
4. ✅ Remove any unused/duplicate variables
5. ✅ Check for extra whitespace in values
6. ✅ Trigger a new deploy

## After Changes
After removing `DATABASE_URL` and Firebase variables, your total environment variable size should be well under 4KB, and the deployment should succeed.

## Note
- `DATABASE_URL` is still needed in your local `.env` file for Prisma migrations
- Just remove it from Netlify environment variables
- The code has been updated to not require `DATABASE_URL` at runtime
