import { createClient } from '@supabase/supabase-js'
import { logAccessEvent } from '../../utils/access-logger'
import { 
  sendAccessRequestApprovedEmail, 
  sendAccessRequestDeniedEmail 
} from '../../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { request_id, action, approved_by_user_id } = body // action: 'approve' or 'deny'

  if (!request_id || !action || !approved_by_user_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: request_id, action, approved_by_user_id'
    })
  }

  if (!['approve', 'deny'].includes(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid action. Must be "approve" or "deny"'
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
    // 1. Get the access request with property details
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
      .eq('id', request_id)
      .single()

    if (requestError || !request) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Access request not found'
      })
    }

    // 2. Verify the user has permission to approve this request
    if (request.property.user_id !== approved_by_user_id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to approve this request'
      })
    }

    // 3. Check if request is in a valid state for approval/denial
    if (!['verified', 'pending'].includes(request.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Request cannot be ${action}d. Current status: ${request.status}`
      })
    }

    // 4. Update the request status
    const newStatus = action === 'approve' ? 'approved' : 'denied'
    const { error: updateError } = await supabase
      .from('safehouse_access_requests')
      .update({ 
        status: newStatus,
        approved_at: new Date().toISOString()
      })
      .eq('id', request_id)

    if (updateError) {
      console.error('Request update error:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update request status'
      })
    }

    // 5. Log the approval/denial event
    await logAccessEvent(config, {
      property_id: request.property_id,
      used_by_name: request.requester_name || 'Unknown',
      used_by_contact: request.requester_phone || request.requester_email,
      access_method: action === 'approve' ? 'REQUEST_APPROVED' : 'REQUEST_DENIED',
      request_id: request.id,
      additional_data: { 
        approved_by: approved_by_user_id,
        action: action 
      }
    })

    // 6. If approved, log the access code usage
    if (action === 'approve') {
      // Find the access code that was used
      const { data: accessCode } = await supabase
        .from('safehouse_access_codes')
        .select('id')
        .eq('access_code', request.access_code_entered)
        .eq('property_id', request.property_id)
        .single()

      if (accessCode) {
        // Log the access code usage
        await logAccessEvent(config, {
          access_code_id: accessCode.id,
          property_id: request.property_id,
          used_by_name: request.requester_name || 'Unknown',
          used_by_contact: request.requester_phone || request.requester_email,
          access_method: 'QR_SCAN_VERIFIED',
          location_data: request.location_data,
          request_id: request.id
        })

        // Increment use count
        await supabase
          .from('safehouse_access_codes')
          .update({ use_count: accessCode.use_count + 1 })
          .eq('id', accessCode.id)
      }
    }

    // 6. Notify requester via email about the decision
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
        console.error('Failed to send decision email to requester:', emailError)
      }
    }

    return {
      success: true,
      message: `Access request ${action}d successfully`,
      request: {
        id: request.id,
        status: newStatus,
        property: request.property
      }
    }
  } catch (error) {
    console.error('Approval error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to process approval'
    })
  }
})
