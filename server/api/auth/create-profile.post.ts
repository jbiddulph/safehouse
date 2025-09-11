import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, fullName, email } = body

  if (!userId || !fullName || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
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
    // First try to insert, if it fails due to duplicate key, update instead
    const { data, error } = await supabase
      .from('safehouse_profiles')
      .insert({
        id: userId,
        full_name: fullName,
        email: email
      })
      .select()
      .single()

    if (error) {
      // If it's a duplicate key error, try to update instead
      if (error.code === '23505') {
        console.log('Profile already exists, updating instead...')
        const { data: updateData, error: updateError } = await supabase
          .from('safehouse_profiles')
          .update({
            full_name: fullName,
            email: email
          })
          .eq('id', userId)
          .select()
          .single()

        if (updateError) {
          console.error('Profile update error:', updateError)
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update profile'
          })
        }

        return { success: true, profile: updateData, action: 'updated' }
      } else {
        console.error('Profile creation error:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create profile'
        })
      }
    }

    return { success: true, profile: data, action: 'created' }
  } catch (error) {
    console.error('Profile creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create profile'
    })
  }
})
