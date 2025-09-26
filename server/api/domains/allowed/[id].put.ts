import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { domain, description, is_active, expires_at } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Domain ID is required'
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
    // Get user from session
    const client = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )
    
    const { data: { session } } = await client.auth.getSession()
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date()
    }

    if (domain !== undefined) updateData.domain = domain.toLowerCase().trim()
    if (description !== undefined) updateData.description = description
    if (is_active !== undefined) updateData.is_active = is_active
    if (expires_at !== undefined) updateData.expires_at = expires_at ? new Date(expires_at) : null

    const { data, error } = await supabase
      .from('safehouse_allowed_domains')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating allowed domain:', error)
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Domain already exists in allowed list'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update allowed domain'
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Allowed domain not found'
      })
    }

    return {
      success: true,
      domain: data,
      message: 'Allowed domain updated successfully'
    }
  } catch (error) {
    console.error('Error in allowed domain update:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update allowed domain'
    })
  }
})
