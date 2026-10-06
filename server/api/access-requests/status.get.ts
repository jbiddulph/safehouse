import { createClient } from '@supabase/supabase-js'
import { verifyAccessRequestStatusToken } from '../../utils/access-request-status-token'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestId = typeof query.request_id === 'string' ? query.request_id : ''
  const token = typeof query.token === 'string' ? query.token : ''

  if (!requestId || !token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'request_id and token are required'
    })
  }

  const config = useRuntimeConfig()
  const secret = config.supabaseServiceRoleKey
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error'
    })
  }

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

  const { data: request, error } = await supabase
    .from('safehouse_access_requests')
    .select(`
      id,
      status,
      requester_email,
      expires_at,
      property:property_id (
        property_name,
        address,
        city,
        state,
        postal_code,
        keysafe_location,
        keysafe_code,
        keysafe_what3words,
        keysafe_latitude,
        keysafe_longitude,
        keysafe_notes,
        keysafe_image_url
      )
    `)
    .eq('id', requestId)
    .single()

  if (error || !request) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Access request not found'
    })
  }

  if (!verifyAccessRequestStatusToken(request.id, request.requester_email, token, secret)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid status token'
    })
  }

  const now = new Date()
  const expiresAt = request.expires_at ? new Date(request.expires_at) : null
  const isExpired = expiresAt ? now > expiresAt && request.status === 'pending' : false

  // Denied / pending / expired: never expose property or keysafe details
  if (request.status === 'denied') {
    return {
      success: true,
      status: 'denied'
    }
  }

  if (isExpired) {
    return {
      success: true,
      status: 'expired'
    }
  }

  if (request.status === 'pending' || request.status === 'verified') {
    return {
      success: true,
      status: request.status === 'verified' ? 'pending' : request.status
    }
  }

  if (request.status !== 'approved') {
    return {
      success: true,
      status: request.status
    }
  }

  // Approved: return the same details included in the requester approval email
  const property = Array.isArray(request.property) ? request.property[0] : request.property
  const propertyAddress = property
    ? [property.address, property.city, property.state, property.postal_code].filter(Boolean).join(', ')
    : ''

  const keysafe = property
    ? {
        location: property.keysafe_location || null,
        code: property.keysafe_code || null,
        what3words: property.keysafe_what3words || null,
        latitude: property.keysafe_latitude != null
          ? parseFloat(String(property.keysafe_latitude))
          : null,
        longitude: property.keysafe_longitude != null
          ? parseFloat(String(property.keysafe_longitude))
          : null,
        notes: property.keysafe_notes || null,
        image_url: property.keysafe_image_url || null
      }
    : null

  const hasKeysafeInfo = !!(
    keysafe &&
    (keysafe.location ||
      keysafe.code ||
      keysafe.what3words ||
      keysafe.latitude != null ||
      keysafe.notes ||
      keysafe.image_url)
  )

  return {
    success: true,
    status: 'approved',
    property_name: property?.property_name || null,
    property_address: propertyAddress || property?.address || null,
    keysafe: hasKeysafeInfo ? keysafe : null
  }
})
