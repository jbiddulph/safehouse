import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { domain, description, expires_at, user_id } = body

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
      .from('safehouse_allowed_domains')
      .insert({
        domain: domain.toLowerCase().trim(),
        description,
        created_by: user_id,
        expires_at: expires_at ? new Date(expires_at) : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating allowed domain:', error)
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Domain already exists in allowed list'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create allowed domain'
      })
    }

    return {
      success: true,
      domain: data,
      message: 'Domain added to allowed list successfully'
    }
  } catch (error) {
    console.error('Error in allowed domain creation:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create allowed domain'
    })
  }
})
