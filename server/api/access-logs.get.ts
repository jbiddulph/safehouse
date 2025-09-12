import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { propertyId, userId, limit = '50', offset = '0' } = query

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing userId parameter'
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
    // Build the query
    let queryBuilder = supabase
      .from('safehouse_access_logs_new')
      .select(`
        *,
        property:property_id (
          id,
          property_name,
          address
        ),
        access_code:access_code_id (
          id,
          access_code,
          code_type,
          access_granted_to
        )
      `)
      .order('used_at', { ascending: false })
      .limit(parseInt(limit as string))
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

    // Filter by property if specified
    if (propertyId) {
      queryBuilder = queryBuilder.eq('property_id', propertyId)
    } else {
      // Filter by user's properties if no specific property
      queryBuilder = queryBuilder.in('property_id', 
        supabase
          .from('safehouse_properties')
          .select('id')
          .eq('user_id', userId)
      )
    }

    const { data: logs, error } = await queryBuilder

    if (error) {
      console.error('Access logs fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch access logs'
      })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('safehouse_access_logs_new')
      .select('*', { count: 'exact', head: true })

    if (propertyId) {
      countQuery = countQuery.eq('property_id', propertyId)
    } else {
      countQuery = countQuery.in('property_id',
        supabase
          .from('safehouse_properties')
          .select('id')
          .eq('user_id', userId)
      )
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Access logs count error:', countError)
    }

    return {
      success: true,
      logs: logs || [],
      pagination: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (count || 0) > parseInt(offset as string) + parseInt(limit as string)
      }
    }
  } catch (error) {
    console.error('Access logs API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch access logs'
    })
  }
})
