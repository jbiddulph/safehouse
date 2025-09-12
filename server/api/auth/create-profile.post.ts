import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const userId = formData.get('userId') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const avatarFile = formData.get('avatarFile') as File

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

  let avatarUrl = null

  // Handle avatar upload if provided
  if (avatarFile) {
    try {
      // Generate unique filename
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${userId}.${fileExt}`
      const filePath = `avatar/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('safehouse')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true // This will overwrite existing files
        })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        // Don't fail the entire registration if avatar upload fails
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('safehouse')
          .getPublicUrl(filePath)
        avatarUrl = urlData.publicUrl
      }
    } catch (avatarError) {
      console.error('Avatar upload error:', avatarError)
      // Don't fail the entire registration if avatar upload fails
    }
  }

  try {
    // First try to insert, if it fails due to duplicate key, update instead
    const { data, error } = await supabase
      .from('safehouse_profiles')
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        avatar_url: avatarUrl
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
            email: email,
            avatar_url: avatarUrl
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
