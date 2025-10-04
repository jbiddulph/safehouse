import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { sendAccessRequestEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    email, 
    property_id, 
    location_verified = false,
    user_location,
    distance_from_property 
  } = body

  if (!email || !property_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and property ID are required'
    })
  }

  // Require location verification for security
  if (!location_verified) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Location verification is required for emergency access requests'
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email format'
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
      .select('id, property_name, address, city, emergency_access_enabled')
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
        statusMessage: 'Emergency access is disabled for this property'
      })
    }

    // 2. Check if domain is in allowed list
    const domain = email.toLowerCase().split('@')[1]
    const { data: allowedDomain } = await supabase
      .from('safehouse_allowed_domains')
      .select('id, domain, expires_at')
      .eq('domain', domain.toLowerCase())
      .eq('is_active', true)
      .single()

    let domainAllowed = false
    if (allowedDomain) {
      // Check if domain has expired
      if (allowedDomain.expires_at) {
        const expiresAt = new Date(allowedDomain.expires_at)
        const now = new Date()
        domainAllowed = now <= expiresAt
      } else {
        domainAllowed = true
      }
    }

    // 3. Generate verification token for the email link
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // 4. Store the email request temporarily with location verification data
    const { error: storeError } = await supabase
      .from('safehouse_access_requests')
      .insert({
        property_id: property_id,
        requester_email: email,
        verification_token: verificationToken,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        ip_address: '127.0.0.1',
        user_agent: 'Email Access Request',
        location_verified: location_verified,
        user_latitude: user_location?.latitude || null,
        user_longitude: user_location?.longitude || null,
        distance_from_property: distance_from_property || null
      })

    if (storeError) {
      console.error('Error storing access request:', storeError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to process access request'
      })
    }

    // 5. Send email with access link
    const baseUrl = config.public.baseUrl || 'http://localhost:3000'
    const accessLink = `${baseUrl}/access-request?property=${property_id}&token=${verificationToken}&email=${encodeURIComponent(email)}`
    
    console.log('BASE_URL from config:', config.public.baseUrl)
    console.log('Using baseUrl:', baseUrl)
    console.log('Generated access link:', accessLink)
    
    try {
      await sendAccessRequestEmail(
        email,
        property.property_name,
        property.address,
        accessLink
      )
      console.log('Access request email sent successfully to:', email)
      console.log('Access link:', accessLink)
    } catch (emailError) {
      console.error('Error sending access request email:', emailError)
      // Don't fail the request if email fails, but log it
      console.log('Email sending failed, but continuing with response. Access link:', accessLink)
    }

    return {
      success: true,
      message: 'Access request email sent successfully',
      domainAllowed,
      email
    }
  } catch (error) {
    console.error('Error in send access request email:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    })
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send access request email: ' + (error.message || 'Unknown error')
    })
  }
})
