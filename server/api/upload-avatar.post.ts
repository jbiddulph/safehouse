import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('avatar') as File
  const userId = formData.get('userId') as string

  if (!file || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing file or userId'
    })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File must be an image'
    })
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File size must be less than 5MB'
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
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `avatar/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('safehouse')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // This will overwrite existing files
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to upload avatar'
      })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('safehouse')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Avatar upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload avatar'
    })
  }
})
