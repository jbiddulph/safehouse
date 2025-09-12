import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { sendMulticastNotification } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    property_id, 
    requester_phone, 
    requester_email, 
    requester_name, 
    access_code_entered,
    ip_address,
    user_agent,
    location_data 
  } = body

  if (!property_id || (!requester_phone && !requester_email) || !access_code_entered) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: property_id, requester contact info, and access_code_entered'
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
    // 1. Verify the property exists and emergency access is enabled
    const { data: property, error: propertyError } = await supabase
      .from('safehouse_properties')
      .select('id, emergency_access_enabled, property_name, address')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    if (!property.emergency_access_enabled) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Emergency access is not enabled for this property'
      })
    }

    // 2. Verify the access code is valid and active
    const { data: accessCode, error: codeError } = await supabase
      .from('safehouse_access_codes')
      .select('*')
      .eq('access_code', access_code_entered)
      .eq('property_id', property_id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (codeError || !accessCode) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired access code'
      })
    }

    // 3. Check if request already exists (prevent spam)
    const { data: existingRequest } = await supabase
      .from('safehouse_access_requests')
      .select('id, status')
      .eq('property_id', property_id)
      .eq('requester_phone', requester_phone || '')
      .eq('requester_email', requester_email || '')
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Access request already pending for this contact'
      })
    }

    // 4. Generate verification token and set expiration
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // 5. Create the access request
    const { data: request, error: requestError } = await supabase
      .from('safehouse_access_requests')
      .insert({
        property_id,
        requester_phone,
        requester_email,
        requester_name,
        access_code_entered,
        verification_token: verificationToken,
        status: 'pending',
        ip_address,
        user_agent,
        location_data,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (requestError) {
      console.error('Access request creation error:', requestError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create access request'
      })
    }

    // 6. Generate verification code (6-digit)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // 7. Create verification code record
    const { error: verificationError } = await supabase
      .from('safehouse_verification_codes')
      .insert({
        request_id: request.id,
        phone_number: requester_phone,
        email_address: requester_email,
        verification_code: verificationCode,
        code_type: requester_phone ? 'sms' : 'email',
        expires_at: codeExpiresAt.toISOString()
      })

    if (verificationError) {
      console.error('Verification code creation error:', verificationError)
      // Don't fail the request, but log the error
    }

    // 8. Send verification code (SMS or Email)
    // TODO: Implement actual SMS/Email sending
    console.log(`Verification code for ${requester_phone || requester_email}: ${verificationCode}`)

    // 9. Send FCM push notifications to property owner and emergency contacts
    try {
      // Get property owner's FCM token
      const { data: propertyOwner } = await supabase
        .from('safehouse_profiles')
        .select('fcm_token')
        .eq('id', property.user_id)
        .single()

      // Get emergency contacts' FCM tokens
      const { data: emergencyContacts } = await supabase
        .from('safehouse_contacts')
        .select('fcm_token')
        .eq('user_id', property.user_id)
        .eq('is_primary', true)
        .not('fcm_token', 'is', null)

      // Collect all FCM tokens
      const fcmTokens = []
      if (propertyOwner?.fcm_token) {
        fcmTokens.push(propertyOwner.fcm_token)
      }
      if (emergencyContacts) {
        fcmTokens.push(...emergencyContacts.map(contact => contact.fcm_token).filter(Boolean))
      }

      // Send push notification
      if (fcmTokens.length > 0) {
        await sendMulticastNotification(
          fcmTokens,
          '🚨 Emergency Access Request',
          `${request.requester_name || 'Unknown'} is requesting access to ${property.property_name}`,
          {
            type: 'access_request',
            request_id: request.id,
            property_id: property_id,
            requester_name: request.requester_name || 'Unknown',
            property_name: property.property_name
          }
        )
        console.log(`Sent FCM notification to ${fcmTokens.length} devices`)
      }
    } catch (fcmError) {
      console.error('Failed to send FCM notification:', fcmError)
      // Don't fail the request if FCM fails
    }

    return {
      success: true,
      request: {
        id: request.id,
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString(),
        property: {
          name: property.property_name,
          address: property.address
        }
      },
      message: 'Access request created. Please check your phone/email for verification code.'
    }
  } catch (error) {
    console.error('Access request creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create access request'
    })
  }
})
