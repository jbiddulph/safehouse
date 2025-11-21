import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    contact_name, 
    email, 
    phone, 
    relationship, 
    is_primary = false,
    is_tenant = false,
    tenant_property_id,
    lease_start_date,
    lease_end_date,
    emergency_access_level = 'standard',
    user_id 
  } = body

  if (!contact_name || !email || !relationship || !user_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
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
    
    // If this is being set as primary, unset any existing primary contact
    if (is_primary) {
      await supabase
        .from('safehouse_contacts')
        .update({ is_primary: false })
        .eq('user_id', user_id)
    }

    const { data, error } = await supabase
      .from('safehouse_contacts')
      .insert({
        user_id,
        contact_name,
        email,
        phone: phone && phone.trim() !== '' ? phone : null,
        relationship,
        is_primary,
        is_tenant: finalIsTenant,
        tenant_property_id: finalIsTenant ? normalizedTenantPropertyId : null,
        lease_start_date: finalIsTenant ? (lease_start_date || null) : null,
        lease_end_date: finalIsTenant ? (lease_end_date || null) : null,
        emergency_access_level,
        notification_preferences: {
          email: true,
          sms: false,
          push: true
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Contact creation error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create contact: ${error.message || 'Unknown error'}`
      })
    }

    return { success: true, contact: data }
  } catch (error: any) {
    console.error('Contact creation error:', error)
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create contact: ${error.message || 'Unknown error'}`
    })
  }
})
