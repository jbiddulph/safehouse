import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, password, passwordConfirmation } = body

  if (!token) {
    return {
      success: false,
      message: 'Reset token is required'
    }
  }

  if (!password || !passwordConfirmation) {
    return {
      success: false,
      message: 'Password and confirmation are required'
    }
  }

  if (password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long'
    }
  }

  if (password !== passwordConfirmation) {
    return {
      success: false,
      message: 'Passwords do not match'
    }
  }

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  try {
    // Supabase handles password reset through the session
    // We need to exchange the token for a session, then update the password
    // However, the standard flow is that Supabase redirects with a hash containing the token
    // For API-based reset, we need to use the admin API
    
    // Try to verify the token and get user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    // If no session, the user needs to use the link from email
    // We'll use the admin API to update the password directly
    const adminSupabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Decode the token to get user info
    // The token from Supabase reset email contains the user info
    // We need to extract email from token or use a different approach
    
    // Alternative: Use Supabase's updateUser method with the recovery token
    // But this requires the user to be authenticated via the recovery flow
    
    // For now, we'll use a simpler approach: store reset tokens in a table
    // and verify them, then update password via admin API
    
    // Check if we have a valid reset token
    const { data: tokenData, error: tokenError } = await adminSupabase
      .from('password_reset_tokens')
      .select('email, created_at')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return {
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset link.'
      }
    }

    // Check if token has expired (1 hour)
    const tokenCreatedAt = new Date(tokenData.created_at)
    const now = new Date()
    const hoursSinceCreation = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceCreation > 1) {
      // Delete expired token
      await adminSupabase
        .from('password_reset_tokens')
        .delete()
        .eq('token', token)
      
      return {
        success: false,
        message: 'Reset token has expired. Please request a new password reset link.'
      }
    }

    // Update password using admin API
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserByEmail(tokenData.email)
    
    if (userError || !userData?.user) {
      return {
        success: false,
        message: 'User not found. Please request a new password reset link.'
      }
    }

    // Update the user's password
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userData.user.id,
      { password: password }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return {
        success: false,
        message: 'Failed to update password. Please try again or request a new reset link.'
      }
    }

    // Delete the used token
    await adminSupabase
      .from('password_reset_tokens')
      .delete()
      .eq('token', token)

    return {
      success: true,
      message: 'Password has been reset successfully'
    }
  } catch (error: any) {
    console.error('Reset password error:', error)
    return {
      success: false,
      message: 'An error occurred while resetting your password. Please try again or request a new reset link.'
    }
  }
})

