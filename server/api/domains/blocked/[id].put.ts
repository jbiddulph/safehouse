import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { domain, reason, is_active, expires_at } = body

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
    if (reason !== undefined) updateData.reason = reason
    if (is_active !== undefined) updateData.is_active = is_active
    if (expires_at !== undefined) updateData.expires_at = expires_at ? new Date(expires_at) : null

    const { data, error } = await supabase
      .from('safehouse_blocked_domains')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blocked domain:', error)
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Domain already exists in blocked list'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update blocked domain'
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Blocked domain not found'
      })
    }

    return {
      success: true,
      domain: data,
      message: 'Blocked domain updated successfully'
    }
  } catch (error) {
    console.error('Error in blocked domain update:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update blocked domain'
    })
  }
})
