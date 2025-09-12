import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    property_id, 
    contact_id, 
    relationship_type = 'emergency_contact',
    can_grant_access = false,
    notification_priority = 1
  } = body

  if (!property_id || !contact_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: property_id and contact_id'
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
    // Check if property belongs to user (for security)
    const { data: property, error: propertyError } = await supabase
      .from('safehouse_properties')
      .select('user_id')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    const { data, error } = await supabase
      .from('safehouse_property_contacts')
      .insert({
        property_id,
        contact_id,
        relationship_type,
        can_grant_access,
        notification_priority
      })
      .select(`
        *,
        contact:safehouse_contacts(*),
        property:safehouse_properties(*)
      `)
      .single()

    if (error) {
      console.error('Property contact creation error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create property contact relationship'
      })
    }

    return { success: true, propertyContact: data }
  } catch (error) {
    console.error('Property contact creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create property contact relationship'
    })
  }
})
