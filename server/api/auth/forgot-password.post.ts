import { createClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '../../utils/email'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email || !email.trim()) {
    return {
      success: false,
      message: 'Email address is required'
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
    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email.trim())

    if (userError || !userData?.user) {
      // Don't reveal if email exists or not for security
      return {
        success: true,
        message: 'If an account exists with this email address, you will receive a password reset link shortly.'
      }
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Store token in database (expires in 1 hour)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Delete any existing tokens for this email
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', email.trim().toLowerCase())

    // Insert new token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email: email.trim().toLowerCase(),
        token: resetToken,
        created_at: new Date().toISOString()
      })

    if (tokenError) {
      console.error('Error storing reset token:', tokenError)
      // Still return success to not reveal if email exists
      return {
        success: true,
        message: 'If an account exists with this email address, you will receive a password reset link shortly.'
      }
    }

    // Construct reset URL with token
    const resetUrl = `${config.public.baseUrl}/auth/reset-password?token=${resetToken}`
    
    // Send custom email
    await sendPasswordResetEmail(email.trim(), resetUrl)

    return {
      success: true,
      message: 'If an account exists with this email address, you will receive a password reset link shortly.'
    }
  } catch (error: any) {
    console.error('Forgot password error:', error)
    // Return success anyway to not reveal if email exists
    return {
      success: true,
      message: 'If an account exists with this email address, you will receive a password reset link shortly.'
    }
  }
})

