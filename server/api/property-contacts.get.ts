import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const propertyId = query.propertyId as string
  const userId = query.userId as string

  if (!propertyId && !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: propertyId or userId'
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
    let request = supabase
      .from('safehouse_property_contacts')
      .select(`
        *,
        contact:safehouse_contacts(*),
        property:safehouse_properties(*)
      `)

    if (propertyId) {
      request = request.eq('property_id', propertyId)
    } else if (userId) {
      // Get all property contacts for user's properties
      request = request.in('property_id', 
        supabase
          .from('safehouse_properties')
          .select('id')
          .eq('user_id', userId)
      )
    }

    const { data, error } = await request.order('notification_priority', { ascending: true })

    if (error) {
      console.error('Property contacts fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch property contacts'
      })
    }

    return { propertyContacts: data || [] }
  } catch (error) {
    console.error('Property contacts fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch property contacts'
    })
  }
})
