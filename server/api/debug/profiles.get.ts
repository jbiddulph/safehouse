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
    const { data, error } = await supabase
      .from('safehouse_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Profiles fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch profiles'
      })
    }

    return { profiles: data }
  } catch (error) {
    console.error('Profiles fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch profiles'
    })
  }
})
