import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
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

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('safehouse_profiles')
      .select('id, subscription_type, subscription_status, additional_credits, stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch profile'
      })
    }

    // Count existing properties
    const { count: propertyCount, error: countError } = await supabase
      .from('safehouse_properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting properties:', countError)
    }

    // Calculate available credits
    // Basic plan gets 1 credit, premium plan gets 1 + additional_credits
    const totalCredits = profile.subscription_type === 'basic' 
      ? 1 
      : 1 + (profile.additional_credits || 0)
    
    const usedCredits = propertyCount || 0
    const maxProperties = 5
    // Available credits is the minimum of: (totalCredits - usedCredits) and (maxProperties - usedCredits)
    const availableCredits = Math.max(0, Math.min(totalCredits - usedCredits, maxProperties - usedCredits))

    return {
      success: true,
      subscriptionType: profile.subscription_type || 'basic',
      subscriptionStatus: profile.subscription_status || 'inactive',
      totalCredits,
      usedCredits,
      availableCredits,
      additionalCredits: profile.additional_credits || 0,
      hasActiveSubscription: profile.subscription_status === 'active',
      stripeSubscriptionId: profile.stripe_subscription_id,
      maxProperties: 5,
      canAddMore: usedCredits < 5
    }
  } catch (error: any) {
    console.error('Get credits error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to get credits'
    })
  }
})

