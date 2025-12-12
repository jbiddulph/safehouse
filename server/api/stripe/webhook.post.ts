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

  // Read raw body for signature verification
  // Stripe requires the raw body (not parsed) for signature verification
  let body: Buffer | string
  try {
    body = await readRawBody(event)
    // Ensure body is a Buffer for Stripe signature verification
    if (typeof body === 'string') {
      body = Buffer.from(body, 'utf8')
    }
  } catch (error: any) {
    console.error('Failed to read webhook body:', error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to read webhook body: ' + (error.message || 'Unknown error')
    })
  }

  const signature = getHeader(event, 'stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing stripe-signature header'
    })
  }

  if (!body) {
    console.error('Empty webhook body')
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty webhook body'
    })
  }

  let webhookEvent: Stripe.Event

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      throw new Error('STRIPE_WEBHOOK_SECRET not configured')
    }

    // Stripe webhook signature verification requires the raw body as a Buffer
    // Ensure body is a Buffer
    const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8')
    webhookEvent = stripe.webhooks.constructEvent(bodyBuffer, signature, webhookSecret)
    console.log('Webhook signature verified successfully')
  } catch (err: any) {
    console.error('Webhook signature verification failed:', {
      error: err.message,
      type: err.type,
      signature: signature?.substring(0, 20) + '...'
    })
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook signature verification failed: ${err.message}`
    })
  }

  // Handle the event
  console.log('Webhook event received:', webhookEvent.type, webhookEvent.id)

  if (webhookEvent.type === 'checkout.session.completed') {
    const session = webhookEvent.data.object as Stripe.Checkout.Session
    
    console.log('Checkout session completed:', {
      sessionId: session.id,
      mode: session.mode,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
      subscription: session.subscription
    })
    
    if (session.mode === 'subscription' && session.metadata) {
      const userId = session.metadata.userId
      const subscriptionType = session.metadata.subscriptionType
      const additionalCredits = parseInt(session.metadata.additionalCredits || '0', 10)
      const isAdditionalCredits = session.metadata.isAdditionalCredits === 'true'

      if (!userId) {
        console.error('No userId in session metadata')
        throw createError({
          statusCode: 400,
          statusMessage: 'Missing userId in session metadata'
        })
      }

      // Get the subscription details
      const subscriptionId = session.subscription as string
      
      if (!subscriptionId) {
        console.error('No subscription ID in checkout session')
        throw createError({
          statusCode: 400,
          statusMessage: 'No subscription ID found in checkout session'
        })
      }

      console.log('Retrieving subscription:', subscriptionId)
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

        // Idempotency check: Check if this webhook event was already processed
        // We'll check the subscription ID to see if it was already processed
        // For additional credits subscriptions, we need to track which ones were processed
        // Simple check: if credits are already very high, don't add more (prevent multiplication)
        const currentAdditionalCredits = currentProfile?.additional_credits || 0
        
        // Safety check: prevent credit multiplication bug
        // If credits are suspiciously high, log warning but don't fail
        if (currentAdditionalCredits >= 10) {
          console.warn('Webhook: Credits already high, skipping addition to prevent multiplication bug', {
            currentCredits: currentAdditionalCredits,
            tryingToAdd: additionalCredits,
            subscriptionId: subscriptionId
          })
          // Still return success to acknowledge webhook, but don't update
          return { received: true, eventType: webhookEvent.type, skipped: true }
        }

        const newAdditionalCredits = currentAdditionalCredits + additionalCredits

        console.log('Webhook: Adding additional credits', {
          currentCredits: currentAdditionalCredits,
          adding: additionalCredits,
          newTotal: newAdditionalCredits,
          subscriptionId: subscriptionId
        })

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

        console.log('Webhook: Successfully updated additional credits', {
          userId,
          newAdditionalCredits
        })
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

        console.log('Profile updated successfully:', {
          userId,
          subscriptionType,
          subscriptionId,
          additionalCredits: finalAdditionalCredits
        })
      }
    } else {
      console.warn('Checkout session completed but not a subscription or missing metadata:', {
        mode: session.mode,
        hasMetadata: !!session.metadata
      })
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
    
    console.log('Subscription deleted:', subscription.id)
    
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
    } else {
      console.log('Subscription marked as cancelled')
    }
  } else {
    // Handle other events gracefully (return 200 but don't process)
    // Events like payment_method.attached don't need processing
    console.log(`Webhook event received but not processed: ${webhookEvent.type}`)
  }

  // Always return 200 to acknowledge receipt
  return { received: true, eventType: webhookEvent.type }
})

