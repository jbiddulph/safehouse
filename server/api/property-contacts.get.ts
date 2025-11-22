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
    const propertyContacts: any[] = []

    // 1. Get contacts from the junction table (safehouse_property_contacts)
    let junctionRequest = supabase
      .from('safehouse_property_contacts')
      .select(`
        *,
        contact:safehouse_contacts(*),
        property:safehouse_properties(*)
      `)

    if (propertyId) {
      junctionRequest = junctionRequest.eq('property_id', propertyId)
    } else if (userId) {
      // Get all property contacts for user's properties
      junctionRequest = junctionRequest.in('property_id', 
        supabase
          .from('safehouse_properties')
          .select('id')
          .eq('user_id', userId)
      )
    }

    const { data: junctionData, error: junctionError } = await junctionRequest.order('notification_priority', { ascending: true })

    if (junctionError) {
      console.error('Property contacts junction table fetch error:', junctionError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch property contacts from junction table'
      })
    }

    // Add junction table contacts to the result
    if (junctionData) {
      propertyContacts.push(...junctionData)
    }

    // 2. Get contacts linked directly via tenant_property_id
    if (propertyId) {
      const { data: directContacts, error: directError } = await supabase
        .from('safehouse_contacts')
        .select('*')
        .eq('tenant_property_id', propertyId)

      if (directError) {
        console.error('Direct property contacts fetch error:', directError)
        // Don't throw - just log the error and continue
      } else if (directContacts) {
        // Convert direct contacts to the same format as junction table contacts
        // Check if they're already in the junction table to avoid duplicates
        const existingContactIds = new Set(propertyContacts.map(pc => pc.contact_id || pc.contact?.id))
        
        for (const contact of directContacts) {
          // Skip if already in junction table
          if (existingContactIds.has(contact.id)) {
            continue
          }
          
          // Create a property contact entry in the same format
          propertyContacts.push({
            id: `direct-${contact.id}`, // Temporary ID for direct links
            property_id: propertyId,
            contact_id: contact.id,
            relationship_type: contact.is_tenant ? 'tenant' : 'emergency_contact',
            can_grant_access: false,
            notification_priority: contact.is_primary ? 1 : 2,
            contact: contact,
            property: null // Will be populated if needed
          })
        }
      }
    } else if (userId) {
      // Get all properties for the user, then get contacts linked via tenant_property_id
      const { data: userProperties } = await supabase
        .from('safehouse_properties')
        .select('id')
        .eq('user_id', userId)

      if (userProperties && userProperties.length > 0) {
        const propertyIds = userProperties.map(p => p.id)
        
        const { data: directContacts, error: directError } = await supabase
          .from('safehouse_contacts')
          .select('*')
          .in('tenant_property_id', propertyIds)

        if (directError) {
          console.error('Direct property contacts fetch error:', directError)
        } else if (directContacts) {
          // Convert direct contacts to the same format
          const existingContactIds = new Set(propertyContacts.map(pc => pc.contact_id || pc.contact?.id))
          
          for (const contact of directContacts) {
            if (existingContactIds.has(contact.id)) {
              continue
            }
            
            propertyContacts.push({
              id: `direct-${contact.id}`,
              property_id: contact.tenant_property_id,
              contact_id: contact.id,
              relationship_type: contact.is_tenant ? 'tenant' : 'emergency_contact',
              can_grant_access: false,
              notification_priority: contact.is_primary ? 1 : 2,
              contact: contact,
              property: null
            })
          }
        }
      }
    }

    // Sort by notification priority
    propertyContacts.sort((a, b) => (a.notification_priority || 999) - (b.notification_priority || 999))

    return { propertyContacts }
  } catch (error) {
    console.error('Property contacts fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch property contacts'
    })
  }
})
