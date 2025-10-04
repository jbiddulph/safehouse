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
    // Check if domain exists
    const { data: existingDomain, error: fetchError } = await supabase
      .from('safehouse_blocked_domains')
      .select('id, domain')
      .eq('id', id)
      .single()

    if (fetchError || !existingDomain) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Blocked domain not found'
      })
    }

    // Delete the domain
    const { error } = await supabase
      .from('safehouse_blocked_domains')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blocked domain:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete blocked domain'
      })
    }

    return {
      success: true,
      message: `Blocked domain '${existingDomain.domain}' deleted successfully`
    }
  } catch (error) {
    console.error('Error in blocked domain deletion:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete blocked domain'
    })
  }
})
