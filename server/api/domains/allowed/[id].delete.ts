import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

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

    // Check if domain exists
    const { data: existingDomain, error: fetchError } = await supabase
      .from('safehouse_allowed_domains')
      .select('id, domain')
      .eq('id', id)
      .single()

    if (fetchError || !existingDomain) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Allowed domain not found'
      })
    }

    // Delete the domain
    const { error } = await supabase
      .from('safehouse_allowed_domains')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting allowed domain:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete allowed domain'
      })
    }

    return {
      success: true,
      message: `Allowed domain '${existingDomain.domain}' deleted successfully`
    }
  } catch (error) {
    console.error('Error in allowed domain deletion:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete allowed domain'
    })
  }
})
