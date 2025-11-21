import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    id, 
    contact_name, 
    email, 
    phone, 
    relationship, 
    is_primary, 
    is_tenant, 
    tenant_property_id, 
    emergency_access_level 
  } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing contact id'
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
    // Normalize tenant_property_id: convert empty string to null
    const normalizedTenantPropertyId = tenant_property_id && tenant_property_id.trim() !== '' 
      ? tenant_property_id 
      : null
    
    // If tenant_property_id is provided, automatically set is_tenant to true
    // (since the frontend now uses "Link contact with property" instead of "is_tenant" checkbox)
    const finalIsTenant = normalizedTenantPropertyId ? true : (is_tenant || false)
    
    // Update the contact
    const { data, error } = await supabase
      .from('safehouse_contacts')
      .update({
        contact_name,
        email,
        phone: phone && phone.trim() !== '' ? phone : null,
        relationship,
        is_primary,
        is_tenant: finalIsTenant,
        tenant_property_id: finalIsTenant ? normalizedTenantPropertyId : null,
        emergency_access_level
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Contact update error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update contact: ${error.message || 'Unknown error'}`
      })
    }

    return { success: true, contact: data, message: 'Contact updated successfully' }
  } catch (error: any) {
    console.error('Contact update API error:', error)
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update contact: ${error.message || 'Unknown error'}`
    })
  }
})
