import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { search, role, page = 1, limit = 50 } = query

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
    const pageNumber = Math.max(1, Number(page) || 1)
    const limitNumber = Math.max(1, Math.min(200, Number(limit) || 50))
    const offset = (pageNumber - 1) * limitNumber

    let queryBuilder = supabase
      .from('safehouse_profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    // Apply role filter
    if (role) {
      queryBuilder = queryBuilder.eq('role', role)
    }

    const { data: users, count, error } = await queryBuilder
      .range(offset, offset + limitNumber - 1)

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
      users: users || [],
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNumber)
      }
    }
  } catch (error) {
    console.error('Error in users API:', error)
    return {
      success: false,
      message: 'Failed to fetch users',
      users: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
      }
    }
  }
})
