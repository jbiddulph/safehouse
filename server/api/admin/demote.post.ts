import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { user_id } = body

  if (!user_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
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
    const { data, error } = await supabase
      .from('safehouse_profiles')
      .update({ role: 'standard' })
      .eq('id', user_id)
      .select()
      .single()

    if (error) {
      console.error('Error demoting user:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to demote user'
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      user: data,
      message: 'User demoted to standard role successfully'
    }
  } catch (error) {
    console.error('Error in user demotion:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to demote user'
    })
  }
})
