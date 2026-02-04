import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing NFC code'
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

  const { data: nfcCode, error: nfcError } = await supabase
    .from('safehouse_nfc_codes')
    .select('id')
    .eq('code_id', code)
    .maybeSingle()

  if (nfcError) {
    console.error('Error loading NFC code:', nfcError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load NFC code'
    })
  }

  if (!nfcCode) {
    throw createError({
      statusCode: 404,
      statusMessage: 'NFC code not found'
    })
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from('safehouse_nfc_code_properties')
    .select('property_id')
    .eq('nfc_code_id', nfcCode.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (assignmentError) {
    console.error('Error loading NFC assignment:', assignmentError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load NFC assignment'
    })
  }

  if (!assignment?.property_id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No property assigned to this NFC code'
    })
  }

  return sendRedirect(event, `/property/${assignment.property_id}`, 302)
})
