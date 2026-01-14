import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nfc_code_id, property_id } = body

  if (!nfc_code_id || !property_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'NFC code ID and property ID are required'
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
    // Verify NFC code exists
    const { data: nfcCode, error: nfcError } = await supabase
      .from('safehouse_nfc_codes')
      .select('id, code_id')
      .eq('id', nfc_code_id)
      .single()

    if (nfcError || !nfcCode) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NFC code not found'
      })
    }

    // Verify property exists
    const { data: property, error: propertyError } = await supabase
      .from('safehouse_properties')
      .select('id, property_name')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from('safehouse_nfc_code_properties')
      .select('id')
      .eq('nfc_code_id', nfc_code_id)
      .eq('property_id', property_id)
      .single()

    if (existingAssignment) {
      return {
        success: true,
        message: 'Property is already assigned to this NFC code'
      }
    }

    // Create assignment
    const { data: assignment, error: assignError } = await supabase
      .from('safehouse_nfc_code_properties')
      .insert({
        nfc_code_id: nfc_code_id,
        property_id: property_id
      })
      .select()
      .single()

    if (assignError) {
      console.error('Error assigning property to NFC code:', assignError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to assign property to NFC code'
      })
    }

    return {
      success: true,
      message: `Property "${property.property_name}" assigned to NFC code ${nfcCode.code_id}`,
      assignment: assignment
    }
  } catch (error: any) {
    console.error('Error in assign NFC code API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to assign property to NFC code'
    })
  }
})
