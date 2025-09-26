import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { domain, reason, expires_at, user_id } = body

  if (!domain) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Domain is required'
    })
  }

  if (!user_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
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

    const { data, error } = await supabase
      .from('safehouse_blocked_domains')
      .insert({
        domain: domain.toLowerCase().trim(),
        reason,
        blocked_by: user_id,
        expires_at: expires_at ? new Date(expires_at) : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating blocked domain:', error)
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Domain already exists in blocked list'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create blocked domain'
      })
    }

    return {
      success: true,
      domain: data,
      message: 'Domain added to blocked list successfully'
    }
  } catch (error) {
    console.error('Error in blocked domain creation:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create blocked domain'
    })
  }
})
