import { createClient } from '@supabase/supabase-js'

// Admin endpoint to fix credit multiplication bugs
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, correctCredits } = body

  if (!userId || correctCredits === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing userId or correctCredits'
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
    // Update user's additional credits to the correct value
    const { error: updateError } = await supabase
      .from('safehouse_profiles')
      .update({
        additional_credits: correctCredits
      })
      .eq('id', userId)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update credits: ' + updateError.message
      })
    }

    return {
      success: true,
      message: `Credits updated to ${correctCredits}`,
      userId,
      additionalCredits: correctCredits
    }
  } catch (error: any) {
    console.error('Fix credits error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fix credits'
    })
  }
})

