import { createClient } from '@supabase/supabase-js'
import { logAccessEvent } from '../../utils/access-logger'
import {
  sendAccessRequestApprovedEmail,
  sendAccessRequestDeniedEmail
} from '../../utils/email'

function renderResponse(title: string, message: string, status: 'success' | 'info' | 'error' = 'info') {
  const colorMap = {
    success: '#047857',
    info: '#1d4ed8',
    error: '#dc2626'
  } as const

  const color = colorMap[status]

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 32px; color: #111827; }
          .card { max-width: 540px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1); }
          h1 { color: ${color}; font-size: 24px; margin-bottom: 16px; }
          p { line-height: 1.6; font-size: 16px; color: #374151; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${title}</h1>
          <p>${message}</p>
        </div>
      </body>
    </html>
  `
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestId = query.request as string
  const token = query.token as string
  const action = (query.action as string)?.toLowerCase()

  if (!requestId || !token || !['approve', 'deny'].includes(action)) {
    setResponseStatus(event, 400)
    setResponseHeader(event, 'Content-Type', 'text/html')
    return renderResponse(
      'Invalid Access Request',
      'The access request link is missing required information or is invalid.',
      'error'
    )
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
    const { data: request, error: requestError } = await supabase
      .from('safehouse_access_requests')
      .select(`
        *,
        property:property_id (
          id,
          property_name,
          address,
          city,
          state,
          postal_code,
          user_id,
          emergency_access_enabled
        )
      `)
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      setResponseStatus(event, 404)
      setResponseHeader(event, 'Content-Type', 'text/html')
      return renderResponse(
        'Access Request Not Found',
        'We could not locate this access request. The link may be incorrect or the request may have expired.',
        'error'
      )
    }

    if (request.verification_token !== token) {
      setResponseStatus(event, 403)
      setResponseHeader(event, 'Content-Type', 'text/html')
      return renderResponse(
        'Unauthorized',
        'The token provided does not match this access request. Please ensure you are using the exact link from your email.',
        'error'
      )
    }

    if (!['pending', 'verified'].includes(request.status)) {
      setResponseHeader(event, 'Content-Type', 'text/html')
      const statusMessage = request.status === 'approved'
        ? 'This access request has already been approved.'
        : request.status === 'denied'
          ? 'This access request has already been denied.'
          : 'This access request can no longer be modified.'

      return renderResponse(
        'Access Request Already Processed',
        statusMessage,
        'info'
      )
    }

    const newStatus = action === 'approve' ? 'approved' : 'denied'
    const now = new Date().toISOString()
    const updatePayload: Record<string, unknown> = {
      status: newStatus
    }

    if (action === 'approve') {
      updatePayload.approved_at = now
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('safehouse_access_requests')
      .update(updatePayload)
      .eq('id', requestId)
      .eq('verification_token', token)
      .in('status', ['pending', 'verified'])
      .select()
      .single()

    if (updateError || !updatedRequest) {
      console.error('Owner action update error:', updateError)
      setResponseStatus(event, 500)
      setResponseHeader(event, 'Content-Type', 'text/html')
      return renderResponse(
        'Unable to Process Request',
        'We encountered an issue while updating this access request. Please try again later.',
        'error'
      )
    }

    await logAccessEvent(config, {
      property_id: request.property_id,
      used_by_name: request.requester_name || 'Unknown',
      used_by_contact: request.requester_phone || request.requester_email,
      access_method: action === 'approve' ? 'REQUEST_APPROVED' : 'REQUEST_DENIED',
      request_id: request.id,
      additional_data: {
        approved_by: request.property.user_id,
        action
      }
    })

    if (action === 'approve') {
      const { data: accessCode } = await supabase
        .from('safehouse_access_codes')
        .select('id, use_count')
        .eq('access_code', request.access_code_entered)
        .eq('property_id', request.property_id)
        .single()

      if (accessCode) {
        await logAccessEvent(config, {
          access_code_id: accessCode.id,
          property_id: request.property_id,
          used_by_name: request.requester_name || 'Unknown',
          used_by_contact: request.requester_phone || request.requester_email,
          access_method: 'QR_SCAN_VERIFIED',
          location_data: request.location_data,
          request_id: request.id
        })

        await supabase
          .from('safehouse_access_codes')
          .update({ use_count: accessCode.use_count + 1 })
          .eq('id', accessCode.id)
      }
    }

    if (request.requester_email) {
      const propertyDisplayAddress = [
        request.property.address,
        request.property.city,
        request.property.state,
        request.property.postal_code
      ].filter(Boolean).join(', ')

      try {
        if (action === 'approve') {
          await sendAccessRequestApprovedEmail(
            request.requester_email,
            request.property.property_name,
            propertyDisplayAddress || request.property.address,
            request.requester_name
          )
        } else {
          await sendAccessRequestDeniedEmail(
            request.requester_email,
            request.property.property_name,
            propertyDisplayAddress || request.property.address,
            request.requester_name
          )
        }
      } catch (emailError) {
        console.error('Owner action decision email failed:', emailError)
      }
    }

    setResponseHeader(event, 'Content-Type', 'text/html')
    return renderResponse(
      action === 'approve' ? 'Access Request Approved' : 'Access Request Denied',
      action === 'approve'
        ? 'You have approved the emergency access request. The requester has been notified.'
        : 'You have denied the emergency access request. The requester has been notified.',
      'success'
    )
  } catch (error) {
    console.error('Owner action handler error:', error)
    setResponseStatus(event, 500)
    setResponseHeader(event, 'Content-Type', 'text/html')
    return renderResponse(
      'Unexpected Error',
      'An unexpected error occurred while processing this access request. Please try again later.',
      'error'
    )
  }
})

