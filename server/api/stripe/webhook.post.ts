import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.stripeSecretKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe secret key not configured'
    })
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2024-11-20.acacia'
  })

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const body = await readRawBody(event)
  const signature = getHeader(event, 'stripe-signature')

  if (!signature || !body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing signature or body'
    })
  }

  let webhookEvent: Stripe.Event

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured')
    }

    webhookEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook Error: ${err.message}`
    })
  }

  // Handle the event
  if (webhookEvent.type === 'checkout.session.completed') {
    const session = webhookEvent.data.object as Stripe.Checkout.Session
    
    if (session.mode === 'subscription' && session.metadata) {
      const userId = session.metadata.userId
      const subscriptionType = session.metadata.subscriptionType
      const additionalCredits = parseInt(session.metadata.additionalCredits || '0', 10)
      const isAdditionalCredits = session.metadata.isAdditionalCredits === 'true'

      // Get the subscription details
      const subscriptionId = session.subscription as string
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      // Calculate subscription end date (1 year from now)
      const subscriptionEndsAt = new Date(subscription.current_period_end * 1000)

      if (isAdditionalCredits) {
        // This is a separate subscription for additional credits
        // Get current profile to add to existing credits
        const { data: currentProfile, error: profileError } = await supabase
          .from('safehouse_profiles')
          .select('additional_credits, subscription_status')
          .eq('id', userId)
          .single()

        if (profileError) {
          console.error('Failed to get current profile:', profileError)
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to get current profile'
          })
        }

        // Add the new credits to existing credits
        const currentAdditionalCredits = currentProfile?.additional_credits || 0
        const newAdditionalCredits = currentAdditionalCredits + additionalCredits

        // Update profile with new total additional credits
        // Note: We don't update stripe_subscription_id here because this is a separate subscription
        const { error: updateError } = await supabase
          .from('safehouse_profiles')
          .update({
            additional_credits: newAdditionalCredits,
            // Keep subscription active if it was already active
            subscription_status: currentProfile?.subscription_status === 'active' ? 'active' : 'active'
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Failed to update profile with additional credits:', updateError)
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update subscription'
          })
        }
      } else {
        // This is the main subscription (initial signup)
        // Basic plan: 1 credit (additional_credits = 0)
        // Premium plan: 1 + additional_credits
        const finalAdditionalCredits = subscriptionType === 'basic' ? 0 : additionalCredits
        
        const { error: updateError } = await supabase
          .from('safehouse_profiles')
          .update({
            subscription_type: subscriptionType,
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            subscription_ends_at: subscriptionEndsAt.toISOString(),
            additional_credits: finalAdditionalCredits
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Failed to update profile with subscription info:', updateError)
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update subscription'
          })
        }
      }
    }
  } else if (webhookEvent.type === 'customer.subscription.updated') {
    const subscription = webhookEvent.data.object as Stripe.Subscription
    
    // Get additional credits from metadata
    const additionalCredits = parseInt(subscription.metadata?.additionalCredits || '0', 10)
    
    // Update subscription status and credits
    const { error: updateError } = await supabase
      .from('safehouse_profiles')
      .update({
        subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
        additional_credits: additionalCredits
      })
      .eq('stripe_subscription_id', subscription.id)

    if (updateError) {
      console.error('Failed to update subscription status:', updateError)
    }
  } else if (webhookEvent.type === 'customer.subscription.deleted') {
    const subscription = webhookEvent.data.object as Stripe.Subscription
    
    // Mark subscription as cancelled
    const { error: updateError } = await supabase
      .from('safehouse_profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (updateError) {
      console.error('Failed to update cancelled subscription:', updateError)
    }
  }

  return { received: true }
})

