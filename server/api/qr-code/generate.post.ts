import { createClient } from '@supabase/supabase-js'
import { resolvePublicBaseUrl } from '../../utils/base-url'
import { buildNfcUrl, buildPropertyUrl, generateQrDataUrl } from '../../utils/qr'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { property_id, mode, nfc_code } = body

  if (!property_id && !nfc_code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing property_id or nfc_code'
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
    const baseUrl = await resolvePublicBaseUrl()
    let property: { id: string; property_name: string } | null = null
    let assignedNfcCode: string | null = nfc_code || null

    if (property_id) {
      const { data: propertyData, error: propertyError } = await supabase
        .from('safehouse_properties')
        .select('id, property_name')
        .eq('id', property_id)
        .single()

      if (propertyError || !propertyData) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Property not found'
        })
      }

      property = propertyData

      if (!assignedNfcCode) {
        const { data: assignment } = await supabase
          .from('safehouse_nfc_code_properties')
          .select('safehouse_nfc_codes(code_id)')
          .eq('property_id', property.id)
          .limit(1)
          .maybeSingle()

        assignedNfcCode = Array.isArray(assignment?.safehouse_nfc_codes)
          ? assignment.safehouse_nfc_codes[0]?.code_id || null
          : assignment?.safehouse_nfc_codes?.code_id || null
      }
    }

    const qrTargetUrl =
      mode === 'property'
        ? property
          ? buildPropertyUrl(baseUrl, property.id)
          : null
        : assignedNfcCode
          ? buildNfcUrl(baseUrl, assignedNfcCode)
          : property
            ? buildPropertyUrl(baseUrl, property.id)
            : null

    if (!qrTargetUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Property mode requires property_id'
      })
    }

    const qrDataUrl = await generateQrDataUrl(qrTargetUrl, 300)

    return {
      success: true,
      qr_code: qrTargetUrl,
      qr_data_url: qrDataUrl,
      assigned_nfc_code: assignedNfcCode || null,
      property: property
        ? {
            id: property.id,
            name: property.property_name
          }
        : null
    }
  } catch (error) {
    console.error('QR code generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate QR code'
    })
  }
})
