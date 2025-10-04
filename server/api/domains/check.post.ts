import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required'
    })
  }

  // Extract domain from email
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) {
    return {
      success: false,
      allowed: false,
      message: 'Invalid email format'
    }
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
    // Check if domain is in allowed list
    const { data: allowedDomain, error } = await supabase
      .from('safehouse_allowed_domains')
      .select('id, domain, description, expires_at')
      .eq('domain', domain.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking allowed domain:', error)
      return {
        success: false,
        allowed: false,
        message: 'Error checking domain status'
      }
    }

    if (!allowedDomain) {
      return {
        success: true,
        allowed: false,
        domain,
        message: 'Domain not in allowed list'
      }
    }

    // Check if domain has expired
    if (allowedDomain.expires_at) {
      const expiresAt = new Date(allowedDomain.expires_at)
      const now = new Date()
      
      if (now > expiresAt) {
        return {
          success: true,
          allowed: false,
          domain,
          message: 'Domain access has expired'
        }
      }
    }

    // Check if domain is blocked
    const { data: blockedDomain, error: blockedError } = await supabase
      .from('safehouse_blocked_domains')
      .select('id, domain, reason, expires_at')
      .eq('domain', domain.toLowerCase())
      .eq('is_active', true)
      .single()

    if (blockedError && blockedError.code !== 'PGRST116') {
      console.error('Error checking blocked domain:', blockedError)
      // Continue even if there's an error checking blocked domains
    }

    if (blockedDomain) {
      // Check if block has expired
      if (blockedDomain.expires_at) {
        const expiresAt = new Date(blockedDomain.expires_at)
        const now = new Date()
        
        if (now > expiresAt) {
          // Block has expired, domain is allowed
          return {
            success: true,
            allowed: true,
            domain,
            message: 'Domain is allowed'
          }
        }
      }
      
      // Domain is blocked and not expired
      return {
        success: true,
        allowed: false,
        domain,
        message: `Domain is blocked: ${blockedDomain.reason || 'No reason provided'}`
      }
    }

    return {
      success: true,
      allowed: true,
      domain,
      message: 'Domain is allowed'
    }
  } catch (error) {
    console.error('Error in domain check:', error)
    return {
      success: false,
      allowed: false,
      message: 'Error checking domain status'
    }
  }
})
