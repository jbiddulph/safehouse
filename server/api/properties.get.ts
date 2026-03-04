import { createClient } from '@supabase/supabase-js'
import { resolvePublicBaseUrl } from '../utils/base-url'
import { buildNfcUrl, generateQrDataUrl } from '../utils/qr'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  // read userId from query to scope results
  const query = getQuery(event)
  const userId = (query.userId as string) || ''
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

    let request = supabase
      .from('safehouse_properties')
      .select(`
        *,
        safehouse_property_contacts(count)
      `)

    if (userId) {
      request = request.eq('user_id', userId)
    }

    const { data, error } = await request.order('created_at', { ascending: false })

    if (error) {
      console.error('Properties fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch properties'
      })
    }

    const properties = data || []
    const propertyIds = properties.map((property: any) => property.id)
    const nfcAssignmentsMap = new Map<string, { code_id: string; url: string; qr_data_url: string }>()

    if (propertyIds.length > 0) {
      const { data: assignments } = await supabase
        .from('safehouse_nfc_code_properties')
        .select('property_id, safehouse_nfc_codes(code_id)')
        .in('property_id', propertyIds)

      const assignmentRows = assignments || []

      for (const assignment of assignmentRows) {
        const propertyId = assignment.property_id
        if (nfcAssignmentsMap.has(propertyId)) continue

        const nfcCode = Array.isArray(assignment.safehouse_nfc_codes)
          ? assignment.safehouse_nfc_codes[0]?.code_id
          : assignment.safehouse_nfc_codes?.code_id

        if (!nfcCode) continue

        const nfcUrl = buildNfcUrl(baseUrl, nfcCode)
        const qrDataUrl = await generateQrDataUrl(nfcUrl, 180)
        nfcAssignmentsMap.set(propertyId, {
          code_id: nfcCode,
          url: nfcUrl,
          qr_data_url: qrDataUrl
        })
      }
    }

    const enrichedProperties = properties.map((property: any) => ({
      ...property,
      nfc_assignment: nfcAssignmentsMap.get(property.id) || null
    }))

    return { properties: enrichedProperties }
  } catch (error) {
    console.error('Properties fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch properties'
    })
  }
})
