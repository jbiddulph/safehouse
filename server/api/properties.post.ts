import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    property_name, 
    address, 
    city, 
    state, 
    postal_code, 
    country = 'GB', 
    property_type = 'residential',
    latitude,
    longitude,
    user_id 
  } = body

  if (!property_name || !address || !city || !user_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  // Validate latitude and longitude are provided
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Latitude and longitude are required'
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
    // Check if user has available credits
    const { data: profile, error: profileError } = await supabase
      .from('safehouse_profiles')
      .select('subscription_type, subscription_status, additional_credits')
      .eq('id', user_id)
      .single()

    if (profileError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check subscription'
      })
    }

    // Check subscription status
    if (profile.subscription_status !== 'active') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Active subscription required to add properties. Please complete your payment.'
      })
    }

    // Count existing properties
    const { count: propertyCount, error: countError } = await supabase
      .from('safehouse_properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)

    if (countError) {
      console.error('Error counting properties:', countError)
    }

    // Calculate available credits
    // Everyone gets 1 base credit + additional_credits
    const totalCredits = 1 + (profile.additional_credits || 0)
    
    const usedCredits = propertyCount || 0
    const availableCredits = totalCredits - usedCredits

    // Enforce 5 property maximum cap
    const maxProperties = 5
    if (usedCredits >= maxProperties) {
      throw createError({
        statusCode: 403,
        statusMessage: `Maximum limit of ${maxProperties} properties reached. Please delete a property before adding more.`
      })
    }

    if (availableCredits <= 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No available credits. Please purchase additional credits to add more properties.'
      })
    }

    // Generate unique QR code and NFC ID
    const qrCode = `SH-${randomBytes(8).toString('hex').toUpperCase()}`
    const nfcId = `NFC-${randomBytes(8).toString('hex').toUpperCase()}`

    const { data, error } = await supabase
      .from('safehouse_properties')
      .insert({
        user_id,
        property_name,
        address,
        city,
        state,
        postal_code,
        country,
        property_type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        qr_code: qrCode,
        nfc_id: nfcId,
        emergency_access_enabled: true
      })
      .select()
      .single()

    if (error) {
      console.error('Property creation error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create property'
      })
    }

    // Generate a default access code for the new property
    try {
      const accessCode = randomBytes(4).toString('hex').toUpperCase()
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Expires in 1 year

      const { error: accessCodeError } = await supabase
        .from('safehouse_access_codes')
        .insert({
          property_id: data.id,
          access_code: accessCode,
          code_type: 'emergency',
          access_granted_to: 'Property Owner',
          access_reason: 'Default emergency access code for property',
          granted_by_user_id: user_id,
          expires_at: expiresAt.toISOString(),
          max_uses: null, // Unlimited uses
          is_active: true
        })

      if (accessCodeError) {
        console.error('Access code creation error:', accessCodeError)
        // Don't fail property creation if access code fails
      } else {
        console.log(`Generated default access code ${accessCode} for property ${data.property_name}`)
      }
    } catch (accessCodeError) {
      console.error('Failed to generate access code for new property:', accessCodeError)
      // Don't fail property creation if access code fails
    }

    return { success: true, property: data }
  } catch (error) {
    console.error('Property creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create property'
    })
  }
})
