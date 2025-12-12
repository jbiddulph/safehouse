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
    // Get property to find user_id
    const { data: property, error: propertyError } = await supabase
      .from('safehouse_properties')
      .select('user_id')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

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

    // Update subscription - property deletion adds a credit back
    // Count remaining properties
    const { count: remainingProperties, error: countError } = await supabase
      .from('safehouse_properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', property.user_id)

    if (!countError) {
      // Update subscription based on remaining properties
      // This will be handled by Stripe webhook, but we can update the local count
      // The actual subscription update should be done via Stripe API
      console.log(`Property deleted. Remaining properties: ${remainingProperties}`)
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
