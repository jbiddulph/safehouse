import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { propertyContactId } = body

  if (!propertyContactId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing propertyContactId'
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
    // Delete the property contact relationship
    const { error } = await supabase
      .from('safehouse_property_contacts')
      .delete()
      .eq('id', propertyContactId)

    if (error) {
      console.error('Property contact delete error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to remove contact from property'
      })
    }

    return { success: true, message: 'Contact removed from property successfully' }
  } catch (error) {
    console.error('Property contact delete API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove contact from property'
    })
  }
})
