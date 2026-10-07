import { createClient } from '@supabase/supabase-js'

export interface AccessLogEntry {
  access_code_id?: string
  property_id: string
  used_by_name?: string
  used_by_contact?: string
  access_method: 'QR_SCAN' | 'QR_SCAN_VERIFIED' | 'MANUAL_ENTRY' | 'NFC' | 'EMAIL_VERIFICATION' | 'REQUEST_CREATED' | 'REQUEST_VERIFIED' | 'REQUEST_APPROVED' | 'REQUEST_DENIED'
  location_data?: any
  request_id?: string
  additional_data?: any
}

export async function logAccessEvent(
  config: any,
  logEntry: AccessLogEntry
): Promise<boolean> {
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
    const { error } = await supabase
      .from('safehouse_access_logs_new')
      .insert({
        access_code_id: logEntry.access_code_id,
        property_id: logEntry.property_id,
        used_by_name: logEntry.used_by_name,
        used_by_contact: logEntry.used_by_contact,
        access_method: logEntry.access_method,
        location_data: logEntry.location_data,
        used_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to log access event:', error)
      return false
    }

    console.log(`Access event logged: ${logEntry.access_method} for property ${logEntry.property_id}`)
    return true
  } catch (error) {
    console.error('Access logging error:', error)
    return false
  }
}

export async function logAccessRequest(
  config: any,
  requestId: string,
  propertyId: string,
  requesterName?: string,
  requesterContact?: string,
  accessMethod: 'QR_SCAN' | 'EMAIL_REQUEST' = 'QR_SCAN'
): Promise<boolean> {
  return logAccessEvent(config, {
    property_id: propertyId,
    used_by_name: requesterName,
    used_by_contact: requesterContact,
    access_method: 'REQUEST_CREATED',
    request_id: requestId,
    additional_data: { request_type: accessMethod }
  })
}

export async function logAccessVerification(
  config: any,
  requestId: string,
  propertyId: string,
  requesterName?: string,
  requesterContact?: string
): Promise<boolean> {
  return logAccessEvent(config, {
    property_id: propertyId,
    used_by_name: requesterName,
    used_by_contact: requesterContact,
    access_method: 'REQUEST_VERIFIED',
    request_id: requestId
  })
}

export async function logAccessCodeUsage(
  config: any,
  accessCodeId: string,
  propertyId: string,
  usedByName?: string,
  usedByContact?: string,
  accessMethod: 'QR_SCAN_VERIFIED' | 'MANUAL_ENTRY' | 'EMAIL_VERIFICATION' = 'QR_SCAN_VERIFIED',
  locationData?: any
): Promise<boolean> {
  return logAccessEvent(config, {
    access_code_id: accessCodeId,
    property_id: propertyId,
    used_by_name: usedByName,
    used_by_contact: usedByContact,
    access_method: accessMethod,
    location_data: locationData
  })
}

/**
 * Dual-write owner approve/deny decisions into the admin analytics table
 * (safehouse_access_logs), which powers /admin/access-logs stats and filters.
 * Session IDs are prefixed so stats can avoid double-counting with
 * REQUEST_APPROVED / REQUEST_DENIED rows in safehouse_access_logs_new.
 */
export async function logAdminAccessDecision(
  config: any,
  params: {
    propertyId: string
    requestId: string
    action: 'approve' | 'deny'
    userEmail?: string | null
    source?: string
  }
): Promise<boolean> {
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

  const accessType = params.action === 'approve' ? 'access_granted' : 'access_denied'
  const source = params.source || 'access-request-decision'

  try {
    const { error } = await supabase
      .from('safehouse_access_logs')
      .insert({
        property_id: params.propertyId,
        user_email: params.userEmail || null,
        access_type: accessType,
        url: source,
        device_type: 'unknown',
        is_mobile: false,
        request_method: 'GET',
        response_status: 200,
        session_id: `access-request:${params.requestId}`
      })

    if (error) {
      console.error('Failed to log admin access decision:', error)
      return false
    }

    console.log(`Admin access decision logged: ${accessType} for property ${params.propertyId}`)
    return true
  } catch (error) {
    console.error('Admin access decision logging error:', error)
    return false
  }
}
