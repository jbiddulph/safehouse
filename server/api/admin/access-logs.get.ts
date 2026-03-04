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
      search,
      sortBy: sortByQuery = 'created_at',
      sortOrder: sortOrderQuery = 'desc'
    } = query

    // Calculate offset for pagination
    const offset = (Number(page) - 1) * Number(limit)
    const normalizedSortBy = Array.isArray(sortByQuery) ? sortByQuery[0] : sortByQuery
    const normalizedSortOrder = Array.isArray(sortOrderQuery) ? sortOrderQuery[0] : sortOrderQuery
    const allowedSortBy = new Set([
      'created_at',
      'property_name',
      'user_email',
      'access_type',
      'device_type'
    ])
    const sortBy = allowedSortBy.has(normalizedSortBy) ? normalizedSortBy : 'created_at'
    const ascending = normalizedSortOrder === 'asc'

    // Build the query
    let queryBuilder = supabase
      .from('safehouse_access_logs')
      .select(`
        *,
        safehouse_properties!left(
          id,
          property_name,
          address,
          user_id
        )
      `)

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

    // Apply sorting
    if (sortBy === 'property_name') {
      queryBuilder = queryBuilder.order('property_name', {
        ascending,
        foreignTable: 'safehouse_properties',
        nullsFirst: false
      })
    } else {
      queryBuilder = queryBuilder.order(sortBy, {
        ascending,
        nullsFirst: false
      })
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

    // Manually fetch property data for each log entry
    let logsWithProperties = await Promise.all(
      (logs || []).map(async (log) => {
        if (log.property_id) {
          try {
            const { data: property, error: propertyError } = await supabase
              .from('safehouse_properties')
              .select('id, property_name, address, user_id')
              .eq('id', log.property_id)
              .single()

            if (!propertyError && property) {
              return {
                ...log,
                safehouse_properties: property
              }
            }
          } catch (error) {
            console.error('Error fetching property for log:', log.id, error)
          }
        }
        
        return {
          ...log,
          safehouse_properties: null
        }
      })
    )

    // Defensive fallback for property name sorting if relation order is unavailable
    if (sortBy === 'property_name') {
      logsWithProperties = logsWithProperties.sort((a, b) => {
        const propertyA = Array.isArray(a.safehouse_properties)
          ? a.safehouse_properties[0]
          : a.safehouse_properties
        const propertyB = Array.isArray(b.safehouse_properties)
          ? b.safehouse_properties[0]
          : b.safehouse_properties
        const nameA = (propertyA?.property_name || '').toLowerCase()
        const nameB = (propertyB?.property_name || '').toLowerCase()
        const result = nameA.localeCompare(nameB)
        return ascending ? result : -result
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
        logs: logsWithProperties || [],
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
