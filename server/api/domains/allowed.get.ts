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
    const { data: allowedDomains, error } = await supabase
      .from('safehouse_allowed_domains')
      .select(`
        id,
        domain,
        description,
        is_active,
        created_at,
        updated_at,
        expires_at,
        created_by
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching allowed domains:', error)
      return {
        success: false,
        message: 'Failed to fetch allowed domains',
        domains: []
      }
    }

    return {
      success: true,
      domains: allowedDomains || []
    }
  } catch (error) {
    console.error('Error in allowed domains API:', error)
    return {
      success: false,
      message: 'Failed to fetch allowed domains',
      domains: []
    }
  }
})
