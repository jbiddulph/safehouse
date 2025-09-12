import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { accessCode, propertyId, usedByName, usedByContact, accessMethod = 'manual', locationData } = body

  if (!accessCode || !propertyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing accessCode or propertyId'
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
    // Find the access code
    const { data: codeData, error: codeError } = await supabase
      .from('safehouse_access_codes')
      .select(`
        *,
        property:property_id (
          id,
          property_name,
          address,
          city,
          emergency_access_enabled
        )
      `)
      .eq('access_code', accessCode)
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .single()

    if (codeError || !codeData) {
      return {
        success: false,
        valid: false,
        message: 'Invalid access code'
      }
    }

    // Check if code is expired
    const now = new Date()
    const expiresAt = new Date(codeData.expires_at)
    
    if (now > expiresAt) {
      return {
        success: false,
        valid: false,
        message: 'Access code has expired'
      }
    }

    // Check if code has reached max uses
    if (codeData.max_uses && codeData.use_count >= codeData.max_uses) {
      return {
        success: false,
        valid: false,
        message: 'Access code has reached maximum uses'
      }
    }

    // Check if property has emergency access enabled
    if (!codeData.property.emergency_access_enabled) {
      return {
        success: false,
        valid: false,
        message: 'Emergency access is disabled for this property'
      }
    }

    // Log the access attempt
    const { error: logError } = await supabase
      .from('safehouse_access_logs')
      .insert({
        access_code_id: codeData.id,
        property_id: propertyId,
        used_by_name: usedByName,
        used_by_contact: usedByContact,
        access_method: accessMethod,
        location_data: locationData,
        used_at: now.toISOString()
      })

    if (logError) {
      console.error('Failed to log access:', logError)
      // Don't fail the validation if logging fails
    }

    // Update use count
    const { error: updateError } = await supabase
      .from('safehouse_access_codes')
      .update({ 
        use_count: codeData.use_count + 1,
        used_at: now.toISOString()
      })
      .eq('id', codeData.id)

    if (updateError) {
      console.error('Failed to update use count:', updateError)
      // Don't fail the validation if update fails
    }

    return {
      success: true,
      valid: true,
      message: 'Access granted',
      property: codeData.property,
      accessCode: {
        id: codeData.id,
        codeType: codeData.code_type,
        grantedTo: codeData.access_granted_to,
        reason: codeData.access_reason,
        expiresAt: codeData.expires_at,
        useCount: codeData.use_count + 1,
        maxUses: codeData.max_uses
      }
    }
  } catch (error) {
    console.error('Access code validation API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to validate access code'
    })
  }
})
