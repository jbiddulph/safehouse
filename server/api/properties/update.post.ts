import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    id,
    property_name, 
    address, 
    city, 
    state, 
    postal_code, 
    country = 'GB', 
    property_type = 'residential',
    latitude,
    longitude,
    keysafe_location,
    keysafe_code,
    keysafe_notes,
    keysafe_what3words,
    keysafe_latitude,
    keysafe_longitude,
    keysafe_image_url,
    property_image_url
  } = body

  if (!id || !property_name || !address || !city) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  // Validate latitude and longitude are provided
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Latitude and longitude are required'
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
    // Prepare update data
    const updateData: any = {
      property_name,
      address,
      city,
      state,
      postal_code,
      country,
      property_type,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      updated_at: new Date().toISOString()
    }

    // Add keysafe fields if provided
    if (keysafe_location !== undefined) {
      updateData.keysafe_location = keysafe_location || null
    }
    if (keysafe_code !== undefined) {
      updateData.keysafe_code = keysafe_code || null
      // Update the timestamp when code is changed
      if (keysafe_code) {
        updateData.keysafe_code_updated_at = new Date().toISOString()
      } else {
        updateData.keysafe_code_updated_at = null
      }
    }
    if (keysafe_notes !== undefined) {
      updateData.keysafe_notes = keysafe_notes || null
    }
    if (keysafe_what3words !== undefined) {
      updateData.keysafe_what3words = keysafe_what3words || null
    }
    if (keysafe_latitude !== null && keysafe_latitude !== undefined) {
      updateData.keysafe_latitude = parseFloat(keysafe_latitude)
    } else if (keysafe_latitude === null) {
      updateData.keysafe_latitude = null
    }
    if (keysafe_longitude !== null && keysafe_longitude !== undefined) {
      updateData.keysafe_longitude = parseFloat(keysafe_longitude)
    } else if (keysafe_longitude === null) {
      updateData.keysafe_longitude = null
    }
    if (keysafe_image_url !== undefined) {
      updateData.keysafe_image_url = keysafe_image_url || null
    }
    if (property_image_url !== undefined) {
      updateData.property_image_url = property_image_url || null
    }

    const { data, error } = await supabase
      .from('safehouse_properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Property update error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update property: ${error.message || 'Unknown error'}`
      })
    }

    return { success: true, property: data }
  } catch (error: any) {
    console.error('Property update error:', error)
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update property: ${error.message || 'Unknown error'}`
    })
  }
})

