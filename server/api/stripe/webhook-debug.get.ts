import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.stripeSecretKey) {
    return {
      error: 'Stripe secret key not configured',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Missing'
    }
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2024-11-20.acacia'
  })

  try {
    // Get recent events to check webhook status
    const events = await stripe.events.list({
      limit: 10,
      types: ['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.updated']
    })

    return {
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Missing',
      recentEvents: events.data.map(e => ({
        id: e.id,
        type: e.type,
        created: new Date(e.created * 1000).toISOString(),
        livemode: e.livemode
      })),
      webhookEndpoint: `${config.public.baseUrl}/api/stripe/webhook`,
      note: 'Make sure this webhook endpoint is configured in Stripe Dashboard'
    }
  } catch (error: any) {
    return {
      error: error.message,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Missing'
    }
  }
})

