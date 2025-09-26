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
    const { data: blockedDomains, error } = await supabase
      .from('safehouse_blocked_domains')
      .select(`
        id,
        domain,
        reason,
        is_active,
        created_at,
        updated_at,
        expires_at,
        blocked_by
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching blocked domains:', error)
      return {
        success: false,
        message: 'Failed to fetch blocked domains',
        domains: []
      }
    }

    return {
      success: true,
      domains: blockedDomains || []
    }
  } catch (error) {
    console.error('Error in blocked domains API:', error)
    return {
      success: false,
      message: 'Failed to fetch blocked domains',
      domains: []
    }
  }
})
