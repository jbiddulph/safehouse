import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { verification_token, verification_code } = body

  if (!verification_token || !verification_code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing verification_token or verification_code'
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
    // 1. Find the access request
    const { data: request, error: requestError } = await supabase
      .from('safehouse_access_requests')
      .select(`
        *,
        property:property_id (
          id,
          property_name,
          address,
          emergency_access_enabled
        )
      `)
      .eq('verification_token', verification_token)
      .eq('status', 'pending')
      .single()

    if (requestError || !request) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invalid or expired verification token'
      })
    }

    // 2. Check if request has expired
    if (new Date(request.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('safehouse_access_requests')
        .update({ status: 'expired' })
        .eq('id', request.id)

      throw createError({
        statusCode: 410,
        statusMessage: 'Access request has expired'
      })
    }

    // 3. Find the verification code
    const { data: verification, error: verificationError } = await supabase
      .from('safehouse_verification_codes')
      .select('*')
      .eq('request_id', request.id)
      .eq('verification_code', verification_code)
      .eq('verified_at', null)
      .single()

    if (verificationError || !verification) {
      // Increment attempts
      await supabase
        .from('safehouse_verification_codes')
        .update({ attempts: verification?.attempts + 1 || 1 })
        .eq('request_id', request.id)

      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid verification code'
      })
    }

    // 4. Check if verification code has expired
    if (new Date(verification.expires_at) < new Date()) {
      throw createError({
        statusCode: 410,
        statusMessage: 'Verification code has expired'
      })
    }

    // 5. Check if max attempts exceeded
    if (verification.attempts >= verification.max_attempts) {
      // Mark request as denied
      await supabase
        .from('safehouse_access_requests')
        .update({ status: 'denied' })
        .eq('id', request.id)

      throw createError({
        statusCode: 429,
        statusMessage: 'Maximum verification attempts exceeded'
      })
    }

    // 6. Mark verification as verified
    const { error: verifyError } = await supabase
      .from('safehouse_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verification.id)

    if (verifyError) {
      console.error('Verification update error:', verifyError)
    }

    // 7. Update request status to verified
    const { error: updateError } = await supabase
      .from('safehouse_access_requests')
      .update({ 
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', request.id)

    if (updateError) {
      console.error('Request update error:', updateError)
    }

    // 8. TODO: Send approval notification to property owner
    // This would trigger notifications to all property contacts

    return {
      success: true,
      message: 'Verification successful. Your access request is being reviewed.',
      request: {
        id: request.id,
        status: 'verified',
        property: request.property
      }
    }
  } catch (error) {
    console.error('Verification error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to verify access request'
    })
  }
})
