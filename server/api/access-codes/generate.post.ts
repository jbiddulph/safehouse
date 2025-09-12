import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    propertyId, 
    codeType = 'emergency', 
    accessGrantedTo, 
    accessReason, 
    expiresInHours = 24,
    maxUses = null 
  } = body

  if (!propertyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing propertyId'
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
    // Generate a secure random access code (8 characters, alphanumeric)
    const accessCode = randomBytes(4).toString('hex').toUpperCase()
    
    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiresInHours)

    // Get the current user from the session (if available)
    const authHeader = getHeader(event, 'authorization')
    let grantedByUserId = null
    let grantedByContactId = null

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        grantedByUserId = user?.id
      } catch (error) {
        console.log('Could not get user from token, proceeding without user context')
      }
    }

    // Create the access code
    const { data: accessCodeData, error } = await supabase
      .from('safehouse_access_codes')
      .insert({
        property_id: propertyId,
        access_code: accessCode,
        code_type: codeType,
        access_granted_to: accessGrantedTo,
        access_reason: accessReason,
        granted_by_user_id: grantedByUserId,
        granted_by_contact_id: grantedByContactId,
        expires_at: expiresAt.toISOString(),
        max_uses: maxUses,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Access code creation error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create access code'
      })
    }

    return { 
      success: true, 
      accessCode: accessCodeData,
      message: 'Access code generated successfully' 
    }
  } catch (error) {
    console.error('Access code generation API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate access code'
    })
  }
})
