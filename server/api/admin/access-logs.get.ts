import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
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

    // Get query parameters
    const query = getQuery(event)
    const {
      page = 1,
      limit = 50,
      propertyId,
      accessType,
      deviceType,
      startDate,
      endDate,
      search
    } = query

    // Calculate offset for pagination
    const offset = (Number(page) - 1) * Number(limit)

    // Build the query
    let queryBuilder = supabase
      .from('safehouse_access_logs')
      .select(`
        *,
        safehouse_properties!inner(
          id,
          property_name,
          address,
          user_id
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (propertyId) {
      queryBuilder = queryBuilder.eq('property_id', propertyId)
    }

    if (accessType) {
      queryBuilder = queryBuilder.eq('access_type', accessType)
    }

    if (deviceType) {
      queryBuilder = queryBuilder.eq('device_type', deviceType)
    }

    if (startDate) {
      queryBuilder = queryBuilder.gte('created_at', startDate)
    }

    if (endDate) {
      queryBuilder = queryBuilder.lte('created_at', endDate)
    }

    if (search) {
      // Search in user email, device model, or property name
      queryBuilder = queryBuilder.or(
        `user_email.ilike.%${search}%,device_model.ilike.%${search}%,safehouse_properties.property_name.ilike.%${search}%`
      )
    }

    // Get total count for pagination
    const { count, error: countError } = await queryBuilder
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error getting access logs count:', countError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get access logs count'
      })
    }

    // Get the actual data with pagination
    const { data: logs, error: logsError } = await queryBuilder
      .range(offset, offset + Number(limit) - 1)

    if (logsError) {
      console.error('Error getting access logs:', logsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get access logs'
      })
    }

    // Get summary statistics
    const { data: stats, error: statsError } = await supabase
      .from('safehouse_access_logs')
      .select('access_type, device_type, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (statsError) {
      console.error('Error getting access logs stats:', statsError)
    }

    // Process stats
    const summaryStats = {
      totalAccesses: stats?.length || 0,
      accessTypes: {} as Record<string, number>,
      deviceTypes: {} as Record<string, number>,
      dailyAccesses: {} as Record<string, number>
    }

    stats?.forEach(stat => {
      // Count by access type
      summaryStats.accessTypes[stat.access_type] = (summaryStats.accessTypes[stat.access_type] || 0) + 1
      
      // Count by device type
      summaryStats.deviceTypes[stat.device_type] = (summaryStats.deviceTypes[stat.device_type] || 0) + 1
      
      // Count by day
      const day = new Date(stat.created_at).toISOString().split('T')[0]
      summaryStats.dailyAccesses[day] = (summaryStats.dailyAccesses[day] || 0) + 1
    })

    return {
      success: true,
      data: {
        logs: logs || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit))
        },
        summary: summaryStats
      }
    }

  } catch (error) {
    console.error('Error in admin access logs API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get access logs: ' + (error.message || 'Unknown error')
    })
  }
})
