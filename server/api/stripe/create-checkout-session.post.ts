import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, subscriptionType, additionalCredits = 0, totalAmount } = body

  if (!userId || !subscriptionType || !totalAmount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: userId, subscriptionType, and totalAmount'
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

  try {
    // Get user profile to get email
    const { data: profile, error: profileError } = await supabase
      .from('safehouse_profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User profile not found'
      })
    }

    // Calculate amount in pence (Stripe uses smallest currency unit)
    const amountInPence = Math.round(totalAmount * 100)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: profile.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: subscriptionType === 'basic' 
                ? 'SafeHouse Basic Plan - 1 Property'
                : 'SafeHouse Premium Plan - 1 Property + Additional Credits',
              description: subscriptionType === 'basic'
                ? 'Yearly subscription for 1 property'
                : `Yearly subscription for 1 property with ${additionalCredits} additional credit${additionalCredits !== 1 ? 's' : ''}`,
            },
            recurring: {
              interval: 'year',
            },
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        subscriptionType,
        additionalCredits: additionalCredits.toString(),
      },
      success_url: `${config.public.baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.public.baseUrl}/payments?canceled=true`,
    })

    return {
      checkoutUrl: session.url,
      sessionId: session.id
    }
  } catch (error: any) {
    console.error('Stripe checkout session creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create checkout session'
    })
  }
})

