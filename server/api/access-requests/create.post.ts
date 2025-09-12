import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { sendMulticastNotification } from '../../utils/firebase'
import { sendAccessRequestNotification, sendAccessRequestConfirmation } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    property_id, 
    requester_phone, 
    requester_email, 
    requester_name, 
    ip_address,
    user_agent,
    location_data 
  } = body

  if (!property_id || (!requester_phone && !requester_email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: property_id and requester contact info'
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

    // 2. Get an active access code for the property
    let { data: accessCode, error: codeError } = await supabase
      .from('safehouse_access_codes')
      .select('*')
      .eq('property_id', property_id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !accessCode) {
      // If no active access code exists, create one automatically
      console.log('No active access code found, creating one automatically...')
      
      const newAccessCode = crypto.randomBytes(4).toString('hex').toUpperCase()
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Expires in 1 year

      const { data: newCode, error: createCodeError } = await supabase
        .from('safehouse_access_codes')
        .insert({
          property_id: property_id,
          access_code: newAccessCode,
          code_type: 'emergency',
          access_granted_to: 'Emergency Access',
          access_reason: 'Auto-generated for emergency access request',
          granted_by_user_id: null,
          expires_at: expiresAt.toISOString(),
          max_uses: null, // Unlimited uses
          is_active: true
        })
        .select()
        .single()

      if (createCodeError || !newCode) {
        console.error('Failed to create emergency access code:', createCodeError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create access code for this property'
        })
      }

      console.log(`Created emergency access code ${newAccessCode} for property ${property.property_name}`)
      accessCode = newCode
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
        access_code_entered: accessCode.access_code,
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

    // 10. Send email notifications to property owner and emergency contacts
    try {
      // Get property owner's email
      const { data: propertyOwner } = await supabase
        .from('safehouse_profiles')
        .select('email')
        .eq('id', property.user_id)
        .single()

      // Get emergency contacts' emails
      const { data: emergencyContacts } = await supabase
        .from('safehouse_contacts')
        .select('email')
        .eq('user_id', property.user_id)
        .eq('is_primary', true)
        .not('email', 'is', null)

      // Send email to property owner
      if (propertyOwner?.email) {
        await sendAccessRequestNotification(
          propertyOwner.email,
          request.requester_name || 'Unknown',
          request.requester_email || 'Not provided',
          property.property_name,
          property.address,
          request.id
        )
      }

      // Send email to emergency contacts
      if (emergencyContacts && emergencyContacts.length > 0) {
        for (const contact of emergencyContacts) {
          if (contact.email) {
            await sendAccessRequestNotification(
              contact.email,
              request.requester_name || 'Unknown',
              request.requester_email || 'Not provided',
              property.property_name,
              property.address,
              request.id
            )
          }
        }
      }

      // Send access code email to requester
      if (request.requester_email) {
        await sendAccessRequestConfirmation(
          request.requester_email,
          request.requester_name || 'there',
          property.property_name,
          property.address,
          request.id,
          accessCode.access_code
        )
      }

      console.log('Email notifications sent successfully')
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError)
      // Don't fail the request if email fails
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
      message: 'Access code sent to your email. Please check your email and enter the code to complete your request.'
    }
  } catch (error) {
    console.error('Access request creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create access request'
    })
  }
})
