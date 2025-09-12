import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  // read userId from query to scope results
  const query = getQuery(event)
  const userId = (query.userId as string) || ''
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
    let request = supabase
      .from('safehouse_properties')
      .select(`
        *,
        safehouse_property_contacts(count)
      `)

    if (userId) {
      request = request.eq('user_id', userId)
    }

    const { data, error } = await request.order('created_at', { ascending: false })

    if (error) {
      console.error('Properties fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch properties'
      })
    }

    return { properties: data }
  } catch (error) {
    console.error('Properties fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch properties'
    })
  }
})
