import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    property_name, 
    address, 
    city, 
    state, 
    postal_code, 
    country = 'US', 
    property_type = 'residential',
    user_id 
  } = body

  if (!property_name || !address || !city || !user_id) {
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
    // Generate unique QR code and NFC ID
    const qrCode = `SH-${randomBytes(8).toString('hex').toUpperCase()}`
    const nfcId = `NFC-${randomBytes(8).toString('hex').toUpperCase()}`

    const { data, error } = await supabase
      .from('safehouse_properties')
      .insert({
        user_id,
        property_name,
        address,
        city,
        state,
        postal_code,
        country,
        property_type,
        qr_code: qrCode,
        nfc_id: nfcId,
        emergency_access_enabled: true
      })
      .select()
      .single()

    if (error) {
      console.error('Property creation error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create property'
      })
    }

    return { success: true, property: data }
  } catch (error) {
    console.error('Property creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create property'
    })
  }
})
