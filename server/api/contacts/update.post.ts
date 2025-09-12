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
    // Update the contact
    const { data, error } = await supabase
      .from('safehouse_contacts')
      .update({
        contact_name,
        email,
        phone,
        relationship,
        is_primary,
        is_tenant,
        tenant_property_id,
        emergency_access_level
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Contact update error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update contact'
      })
    }

    return { success: true, contact: data, message: 'Contact updated successfully' }
  } catch (error) {
    console.error('Contact update API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update contact'
    })
  }
})
