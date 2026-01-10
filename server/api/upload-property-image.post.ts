import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('propertyImage') as File
  const propertyId = formData.get('propertyId') as string

  if (!file || !propertyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing file or propertyId'
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
    // Generate unique filename using propertyId and timestamp
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${propertyId}_${timestamp}.${fileExt}`
    const filePath = `property/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('safehouse')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // This will overwrite existing files with the same name
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to upload property image'
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
    console.error('Property image upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload property image'
    })
  }
})

