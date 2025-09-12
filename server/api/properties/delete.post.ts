import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { propertyId } = body

  if (!propertyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing propertyId'
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
    // Delete the property (this will cascade to property_contacts and access_logs due to foreign key constraints)
    const { error } = await supabase
      .from('safehouse_properties')
      .delete()
      .eq('id', propertyId)

    if (error) {
      console.error('Property delete error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete property'
      })
    }

    return { success: true, message: 'Property deleted successfully' }
  } catch (error) {
    console.error('Property delete API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete property'
    })
  }
})
