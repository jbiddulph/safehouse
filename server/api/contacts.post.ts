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
        phone,
        relationship,
        is_primary,
        is_tenant,
        tenant_property_id: is_tenant ? tenant_property_id : null,
        lease_start_date: is_tenant ? lease_start_date : null,
        lease_end_date: is_tenant ? lease_end_date : null,
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
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create contact'
      })
    }

    return { success: true, contact: data }
  } catch (error) {
    console.error('Contact creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create contact'
    })
  }
})
