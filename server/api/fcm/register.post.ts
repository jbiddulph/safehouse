import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fcm_token, user_type = 'owner' } = body // user_type: 'owner' or 'contact'

  if (!fcm_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing fcm_token'
    })
  }

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

  try {
    // For testing purposes, we'll use a mock user ID (valid UUID format)
    // In production, this would be handled by auth middleware
    const mockUserId = '123e4567-e89b-12d3-a456-426614174000'
    
    // Get user ID from session (this would be handled by auth middleware in production)
    // const { data: { session } } = await supabase.auth.getSession()
    // if (!session?.user?.id) {
    //   throw createError({
    //     statusCode: 401,
    //     statusMessage: 'Unauthorized'
    //   })
    // }

    if (user_type === 'owner') {
      // Update user profile with FCM token
      const { error } = await supabase
        .from('safehouse_profiles')
        .update({ fcm_token })
        .eq('id', mockUserId)

      if (error) {
        console.error('Failed to update profile FCM token:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to register FCM token'
        })
      }
    } else if (user_type === 'contact') {
      // This would be for emergency contacts who have their own app
      // For now, we'll just log it
      console.log('Contact FCM token registration:', fcm_token)
    }

    return {
      success: true,
      message: 'FCM token registered successfully'
    }
  } catch (error) {
    console.error('FCM token registration error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to register FCM token'
    })
  }
})
