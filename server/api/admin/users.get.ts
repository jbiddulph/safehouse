import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { search, role } = query

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
    let queryBuilder = supabase
      .from('safehouse_profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    // Apply role filter
    if (role) {
      queryBuilder = queryBuilder.eq('role', role)
    }

    const { data: users, error } = await queryBuilder

    if (error) {
      console.error('Error fetching users:', error)
      return {
        success: false,
        message: 'Failed to fetch users',
        users: []
      }
    }

    return {
      success: true,
      users: users || []
    }
  } catch (error) {
    console.error('Error in users API:', error)
    return {
      success: false,
      message: 'Failed to fetch users',
      users: []
    }
  }
})
