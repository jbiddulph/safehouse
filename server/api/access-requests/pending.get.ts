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
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()

    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    // Get properties owned by this user
    const { data: properties, error: propertiesError } = await supabase
      .from('safehouse_properties')
      .select('id, property_name')
      .eq('user_id', session.user.id)

    if (propertiesError) {
      console.error('Error fetching owner properties for pending requests:', propertiesError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load pending access requests'
      })
    }

    if (!properties || properties.length === 0) {
      return {
        success: true,
        pending: [],
        count: 0
      }
    }

    const propertyIds = properties.map(p => p.id)

    // Fetch pending / verified access requests for these properties
    const { data: requests, error: requestsError } = await supabase
      .from('safehouse_access_requests')
      .select(`
        id,
        property_id,
        requester_name,
        requester_email,
        requester_phone,
        status,
        created_at,
        property:property_id (
          id,
          property_name
        )
      `)
      .in('property_id', propertyIds)
      .in('status', ['pending', 'verified'])
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching pending access requests:', requestsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load pending access requests'
      })
    }

    return {
      success: true,
      pending: requests || [],
      count: requests?.length || 0
    }
  } catch (error: any) {
    console.error('Error in pending access requests endpoint:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || error?.message || 'Failed to load pending access requests'
    })
  }
})




