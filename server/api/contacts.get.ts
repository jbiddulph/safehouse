import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
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
      .from('safehouse_contacts')
      .select('*')

    if (userId) {
      request = request.eq('user_id', userId)
    }

    const { data, error } = await request
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Contacts fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch contacts'
      })
    }

    return { contacts: data }
  } catch (error) {
    console.error('Contacts fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch contacts'
    })
  }
})
