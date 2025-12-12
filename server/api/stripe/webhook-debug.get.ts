export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Check if Stripe is configured
  const stripeConfigured = !!config.stripeSecretKey
  const webhookSecretSet = !!process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeConfigured) {
    return {
      error: 'Stripe secret key not configured',
      webhookSecret: webhookSecretSet ? 'Set' : 'Missing',
      webhookEndpoint: `${config.public.baseUrl}/api/stripe/webhook`,
      note: 'This is a debug endpoint. Do NOT add it as a webhook in Stripe Dashboard.'
    }
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-11-20.acacia'
    })

    // Get recent events to check webhook status
    const events = await stripe.events.list({
      limit: 10,
      types: ['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.updated']
    })

    return {
      webhookSecret: webhookSecretSet ? 'Set' : 'Missing',
      recentEvents: events.data.map(e => ({
        id: e.id,
        type: e.type,
        created: new Date(e.created * 1000).toISOString(),
        livemode: e.livemode
      })),
      webhookEndpoint: `${config.public.baseUrl}/api/stripe/webhook`,
      note: 'This is a debug endpoint. Do NOT add it as a webhook in Stripe Dashboard. Only add /api/stripe/webhook'
    }
  } catch (error: any) {
    return {
      error: error.message,
      webhookSecret: webhookSecretSet ? 'Set' : 'Missing',
      webhookEndpoint: `${config.public.baseUrl}/api/stripe/webhook`,
      note: 'This is a debug endpoint. Do NOT add it as a webhook in Stripe Dashboard.'
    }
  }
})

