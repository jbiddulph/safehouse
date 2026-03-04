import { createClient } from '@supabase/supabase-js'
import { resolvePublicBaseUrl } from '../../utils/base-url'
import { buildNfcUrl, generateQrDataUrl } from '../../utils/qr'

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
    const baseUrl = await resolvePublicBaseUrl()

    const { data: property, error } = await supabase
      .from('safehouse_properties')
      .select(`
        id,
        property_name,
        address,
        city,
        state,
        postal_code,
        country,
        property_type,
        qr_code,
        nfc_id,
        emergency_access_enabled,
        latitude,
        longitude,
        created_at,
        updated_at
      `)
      .eq('id', propertyId)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Property not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch property'
      })
    }

    if (!property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    let nfcAssignment: { code_id: string; url: string; qr_data_url: string } | null = null

    const { data: assignment } = await supabase
      .from('safehouse_nfc_code_properties')
      .select('safehouse_nfc_codes(code_id)')
      .eq('property_id', property.id)
      .limit(1)
      .maybeSingle()

    const nfcCode = Array.isArray(assignment?.safehouse_nfc_codes)
      ? assignment.safehouse_nfc_codes[0]?.code_id
      : assignment?.safehouse_nfc_codes?.code_id

    if (nfcCode) {
      const nfcUrl = buildNfcUrl(baseUrl, nfcCode)
      const qrDataUrl = await generateQrDataUrl(nfcUrl, 220)
      nfcAssignment = {
        code_id: nfcCode,
        url: nfcUrl,
        qr_data_url: qrDataUrl
      }
    }

    return {
      success: true,
      property: {
        ...property,
        nfc_assignment: nfcAssignment
      }
    }
  } catch (error) {
    console.error('Error in property API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch property'
    })
  }
})
