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

  try {
    // Get count of active access codes
    const { count, error } = await supabase
      .from('safehouse_access_codes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())

    if (error) {
      console.error('Active access codes fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch active access codes'
      })
    }

    return { activeAccessCodes: count || 0 }
  } catch (error) {
    console.error('Active access codes API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch active access codes'
    })
  }
})
