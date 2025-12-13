# Stripe Webhook Setup Guide

## Problem
If your subscription status is stuck at "pending" after payment, the Stripe webhook is likely not configured or not working.

## Solution

### Step 1: Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://mysafehouse.netlify.app/api/stripe/webhook`
   - **IMPORTANT:** Only add `/api/stripe/webhook` - NOT the webhook-debug endpoint
   - The webhook-debug endpoint is just for debugging, not a webhook
4. Select events to listen for:
   - `checkout.session.completed` ✅ **REQUIRED**
   - `customer.subscription.created` (optional)
   - `customer.subscription.updated` ✅ **REQUIRED**
   - `customer.subscription.deleted` ✅ **REQUIRED**
   - You can ignore `payment_method.attached` - it's handled gracefully
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add it to your Netlify environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 2: Test Webhook

1. Visit `/api/stripe/webhook-debug` to check webhook configuration
2. Make a test payment
3. Check Stripe Dashboard → Webhooks → Your endpoint → Recent events
4. Look for any failed webhook deliveries

### Step 3: Manual Verification (If Webhook Fails)

If the webhook isn't working, you can manually verify the payment:

1. After payment, you'll be redirected to `/payment-success?session_id=xxx`
2. The page will automatically verify your payment
3. If that fails, you can manually call the verify endpoint

### Step 4: Check Webhook Logs

Check your Netlify function logs for webhook errors:
- Go to Netlify Dashboard → Functions → View logs
- Look for errors related to webhook processing

## Common Issues

### Issue 1: Webhook Secret Not Set
**Symptom:** Webhook returns 500 error
**Fix:** Add `STRIPE_WEBHOOK_SECRET` to Netlify environment variables

### Issue 2: Webhook Endpoint Not Accessible
**Symptom:** Stripe shows webhook delivery failures
**Fix:** Ensure your Netlify site is deployed and the endpoint is publicly accessible

### Issue 3: Webhook Events Not Configured
**Symptom:** Webhook receives events but doesn't process them
**Fix:** Make sure all required events are selected in Stripe Dashboard

### Issue 4: Test Mode vs Live Mode
**Symptom:** Webhook works in test but not production
**Fix:** Make sure you're using the correct webhook secret for your environment (test vs live)

## Manual Fix (If Needed)

If your subscription is stuck at "pending", you can manually verify it:

1. Get your checkout session ID from the payment success URL
2. Call the verify endpoint (it's automatically called on payment-success page)
3. Or manually update in database if needed

## Verification

After setting up the webhook:
1. Make a test payment
2. Check Stripe Dashboard → Webhooks → Recent deliveries
3. Verify the webhook was called successfully
4. Check your database - `subscription_status` should be 'active'

