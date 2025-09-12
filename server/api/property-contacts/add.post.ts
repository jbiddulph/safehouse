import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { propertyId, contactId, relationshipType = 'emergency_contact', canGrantAccess = false, notificationPriority = 1 } = body

  if (!propertyId || !contactId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing propertyId or contactId'
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
    // Check if the relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('safehouse_property_contacts')
      .select('id')
      .eq('property_id', propertyId)
      .eq('contact_id', contactId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Check existing relationship error:', checkError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check existing relationship'
      })
    }

    if (existing) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Contact is already linked to this property'
      })
    }

    // Create the property contact relationship
    const { data, error } = await supabase
      .from('safehouse_property_contacts')
      .insert({
        property_id: propertyId,
        contact_id: contactId,
        relationship_type: relationshipType,
        can_grant_access: canGrantAccess,
        notification_priority: notificationPriority
      })
      .select(`
        *,
        contact:safehouse_contacts (
          id,
          contact_name,
          email,
          relationship,
          is_primary,
          is_tenant,
          emergency_access_level
        )
      `)
      .single()

    if (error) {
      console.error('Property contact creation error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to add contact to property'
      })
    }

    return { success: true, propertyContact: data, message: 'Contact added to property successfully' }
  } catch (error) {
    console.error('Property contact add API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add contact to property'
    })
  }
})
