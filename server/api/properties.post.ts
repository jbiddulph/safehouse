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
  
  // Validate service role key is configured
  if (!config.supabaseServiceRoleKey || config.supabaseServiceRoleKey.trim() === '') {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not configured in environment variables')
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error: Supabase service role key is missing',
      data: {
        message: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Please check your .env file.',
        hint: 'Get your service role key from Supabase Dashboard > Settings > API > service_role key (not the anon key)'
      }
    })
  }
  
  // Validate service role key format (should be a JWT token)
  if (!config.supabaseServiceRoleKey.startsWith('eyJ')) {
    console.error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (should start with eyJ)')
    console.error('Key starts with:', config.supabaseServiceRoleKey.substring(0, 10))
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error: Invalid Supabase service role key format',
      data: {
        message: 'SUPABASE_SERVICE_ROLE_KEY appears to be invalid. Service role keys are JWT tokens that start with "eyJ".',
        hint: 'Make sure you are using the service_role key, not the anon key. Get it from Supabase Dashboard > Settings > API'
      }
    })
  }
  
  // Validate Supabase URL is configured
  if (!config.public.supabaseUrl || config.public.supabaseUrl.trim() === '') {
    console.error('SUPABASE_URL is not configured in environment variables')
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error: Supabase URL is missing',
      data: {
        message: 'SUPABASE_URL environment variable is not set. Please check your .env file.'
      }
    })
  }
  
  // Log configuration (without exposing the full key)
  console.log('Creating Supabase client with URL:', config.public.supabaseUrl)
  console.log('Service role key exists:', !!config.supabaseServiceRoleKey)
  console.log('Service role key length:', config.supabaseServiceRoleKey?.length)
  console.log('Service role key starts with:', config.supabaseServiceRoleKey?.substring(0, 20) + '...')
  
  // Check if using local Supabase
  const isLocalSupabase = config.public.supabaseUrl?.includes('127.0.0.1') || 
                          config.public.supabaseUrl?.includes('localhost')
  
  if (isLocalSupabase) {
    console.log('Detected local Supabase instance')
    // For local Supabase, the service role key should be the demo one
    // If the key doesn't match local format, warn the user
    const isLocalKey = config.supabaseServiceRoleKey?.includes('supabase-demo') || 
                       config.supabaseServiceRoleKey?.includes('1983812996')
    
    if (!isLocalKey) {
      console.warn('WARNING: Using local Supabase URL but service role key appears to be from cloud instance')
      console.warn('For local Supabase, use the service_role key from your local .env file (usually from Supabase CLI)')
    }
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
  
  // Test the connection by making a simple query
  console.log('Testing Supabase connection...')
  const { data: testData, error: testError } = await supabase
    .from('safehouse_properties')
    .select('id')
    .limit(1)
  
  if (testError) {
    console.error('Supabase connection test failed:', testError)
    
    // Provide specific guidance based on error
    let hint = 'Check that your SUPABASE_SERVICE_ROLE_KEY is correct and has not expired.'
    if (isLocalSupabase) {
      hint = 'For local Supabase, make sure you are using the service_role key from your local Supabase instance. ' +
             'Run `supabase status` to see your local keys, or check your local .env file.'
    } else {
      hint = 'Get a new key from Supabase Dashboard > Settings > API > service_role key (not the anon key)'
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to connect to Supabase',
      data: {
        supabaseError: {
          message: testError.message,
          details: (testError as any).details,
          hint: (testError as any).hint,
          code: (testError as any).code
        },
        hint: hint,
        isLocalSupabase: isLocalSupabase
      }
    })
  }
  
  console.log('Supabase connection test successful')

  try {
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
      console.error('Property creation error (Supabase):', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create property',
        data: {
          supabaseError: {
            message: error.message,
            details: (error as any).details,
            hint: (error as any).hint,
            code: (error as any).code
          }
        }
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
  } catch (error: any) {
    console.error('Property creation error (outer catch):', error)
    // If this is already an h3 createError with statusCode, rethrow it so we don't lose details
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create property',
      data: {
        message: error?.message,
        stack: error?.stack
      }
    })
  }
})
