import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const propertyId = getRouterParam(event, 'id')

  if (!propertyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Property ID is required'
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
    // Get access codes for the property
    const { data: accessCodes, error } = await supabase
      .from('safehouse_access_codes')
      .select(`
        id,
        access_code,
        code_type,
        access_granted_to,
        access_reason,
        granted_by_user_id,
        granted_by_contact_id,
        expires_at,
        max_uses,
        use_count,
        is_active,
        created_at
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Access codes fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch access codes'
      })
    }

    return {
      success: true,
      accessCodes: accessCodes || []
    }
  } catch (error) {
    console.error('Access codes fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch access codes'
    })
  }
})
