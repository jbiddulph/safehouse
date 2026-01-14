import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nfc_code_id, property_id } = body

  if (!nfc_code_id || !property_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'NFC code ID and property ID are required'
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
    // Remove assignment
    const { error: deleteError } = await supabase
      .from('safehouse_nfc_code_properties')
      .delete()
      .eq('nfc_code_id', nfc_code_id)
      .eq('property_id', property_id)

    if (deleteError) {
      console.error('Error removing property assignment:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to remove property assignment'
      })
    }

    return {
      success: true,
      message: 'Property assignment removed successfully'
    }
  } catch (error: any) {
    console.error('Error in unassign NFC code API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove property assignment'
    })
  }
})
