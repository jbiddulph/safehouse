import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { additionalCredits } = body

  if (!additionalCredits || additionalCredits < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid number of credits. Must be at least 1.'
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('safehouse_profiles')
      .select('email, full_name, stripe_customer_id, stripe_subscription_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User profile not found'
      })
    }

    if (profile.subscription_status !== 'active') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Active subscription required to purchase additional credits'
      })
    }

    // Check current property count to enforce 5 property cap
    const { count: currentPropertyCount, error: countError } = await supabase
      .from('safehouse_properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting properties:', countError)
    }

    const maxProperties = 5
    const currentProperties = currentPropertyCount || 0
    const maxAdditionalCredits = maxProperties - currentProperties

    if (maxAdditionalCredits <= 0) {
      throw createError({
        statusCode: 403,
        statusMessage: `You have reached the maximum limit of ${maxProperties} properties. Please delete a property before adding more.`
      })
    }

    if (additionalCredits > maxAdditionalCredits) {
      throw createError({
        statusCode: 400,
        statusMessage: `You can only purchase up to ${maxAdditionalCredits} more credit${maxAdditionalCredits !== 1 ? 's' : ''} (maximum ${maxProperties} properties total)`
      })
    }

    // Calculate amount: £12 per additional credit per year
    const amountPerCredit = 12
    const totalAmount = additionalCredits * amountPerCredit
    const amountInPence = Math.round(totalAmount * 100)

    // Always create a NEW separate subscription for additional credits
    // This creates a separate yearly subscription that runs alongside the main subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: profile.stripe_customer_id || undefined,
      customer_email: profile.stripe_customer_id ? undefined : (profile.email || undefined),
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `SafeHouse - ${additionalCredits} Additional Credit${additionalCredits !== 1 ? 's' : ''}`,
              description: `Yearly subscription for ${additionalCredits} additional property credit${additionalCredits !== 1 ? 's' : ''} (separate subscription)`
            },
            recurring: {
              interval: 'year'
            },
            unit_amount: amountInPence
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: user.id,
        subscriptionType: 'premium',
        additionalCredits: additionalCredits.toString(),
        isAdditionalCredits: 'true',
        purchaseDate: new Date().toISOString()
      },
      success_url: `${config.public.baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.public.baseUrl}/dashboard?canceled=true`
    })

    return {
      checkoutUrl: session.url,
      sessionId: session.id
    }
  } catch (error: any) {
    console.error('Purchase credits error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to purchase credits'
    })
  }
})

