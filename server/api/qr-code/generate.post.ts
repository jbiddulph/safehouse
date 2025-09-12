import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { property_id } = body

  if (!property_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing property_id'
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
    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('safehouse_properties')
      .select('id, property_name, qr_code')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(property.qr_code, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return {
      success: true,
      qr_code: property.qr_code,
      qr_data_url: qrDataUrl,
      property: {
        id: property.id,
        name: property.property_name
      }
    }
  } catch (error) {
    console.error('QR code generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate QR code'
    })
  }
})
