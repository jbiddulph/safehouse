import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { contactId } = body

  if (!contactId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing contactId'
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
    // Delete the contact (this will cascade to property_contacts due to foreign key constraints)
    const { error } = await supabase
      .from('safehouse_contacts')
      .delete()
      .eq('id', contactId)

    if (error) {
      console.error('Contact delete error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete contact'
      })
    }

    return { success: true, message: 'Contact deleted successfully' }
  } catch (error) {
    console.error('Contact delete API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete contact'
    })
  }
})
