import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    // Basic email validation
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

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('safehouse_newsletter')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      return {
        success: true,
        message: 'You are already subscribed to our newsletter!',
        alreadySubscribed: true
      }
    }

    // Insert new newsletter subscription
    const { data, error } = await supabase
      .from('safehouse_newsletter')
      .insert({
        email: normalizedEmail
      })
      .select()
      .single()

    if (error) {
      console.error('Newsletter subscription error:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to subscribe to newsletter. Please try again later.'
      })
    }

    return {
      success: true,
      message: 'Thank you for subscribing! We\'ll notify you when we launch.',
      data
    }
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to subscribe to newsletter'
    })
  }
})

