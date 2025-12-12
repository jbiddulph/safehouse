import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sessionId } = body

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing sessionId'
    })
  }

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

  // Get user from session
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Checkout session not found'
      })
    }

    // Check if payment was successful
    if (session.payment_status === 'paid' && session.mode === 'subscription') {
      const subscriptionId = session.subscription as string
      
      if (!subscriptionId) {
        throw createError({
          statusCode: 500,
          statusMessage: 'No subscription ID found in session'
        })
      }

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      // Get metadata
      const userId = session.metadata?.userId || user.id
      const subscriptionType = session.metadata?.subscriptionType || 'basic'
      const additionalCredits = parseInt(session.metadata?.additionalCredits || '0', 10)
      const isAdditionalCredits = session.metadata?.isAdditionalCredits === 'true'

      // Calculate subscription end date
      const subscriptionEndsAt = new Date(subscription.current_period_end * 1000)

      if (isAdditionalCredits) {
        // This is additional credits - add to existing
        const { data: currentProfile } = await supabase
          .from('safehouse_profiles')
          .select('additional_credits')
          .eq('id', userId)
          .single()

        const currentAdditionalCredits = currentProfile?.additional_credits || 0
        const newAdditionalCredits = currentAdditionalCredits + additionalCredits

        const { error: updateError } = await supabase
          .from('safehouse_profiles')
          .update({
            additional_credits: newAdditionalCredits,
            subscription_status: 'active'
          })
          .eq('id', userId)

        if (updateError) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update profile: ' + updateError.message
          })
        }

        return {
          success: true,
          message: 'Additional credits added successfully',
          additionalCredits: newAdditionalCredits
        }
      } else {
        // Main subscription
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
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update profile: ' + updateError.message
          })
        }

        return {
          success: true,
          message: 'Subscription activated successfully',
          subscriptionType,
          subscriptionId,
          customerId: session.customer,
          subscriptionEndsAt: subscriptionEndsAt.toISOString()
        }
      }
    } else {
      return {
        success: false,
        message: 'Payment not completed',
        paymentStatus: session.payment_status,
        mode: session.mode
      }
    }
  } catch (error: any) {
    console.error('Verify payment error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to verify payment'
    })
  }
})

