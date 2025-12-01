import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('photo') as File
  const propertyId = formData.get('propertyId') as string
  const propertyCaption = formData.get('propertyCaption') as string

  if (!file || !propertyId || !propertyCaption) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing file, propertyId, or propertyCaption'
    })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File must be an image'
    })
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File size must be less than 10MB'
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
    // Convert property caption to slug
    // Remove special characters, convert to lowercase, replace spaces with hyphens
    const slug = propertyCaption
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

    // Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    
    // Generate filename: {property_id}{property-caption-slug}.{ext}
    const fileName = `${propertyId}${slug}.${fileExt}`
    const filePath = `property/${fileName}`

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
        statusMessage: 'Failed to upload property photo'
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
    console.error('Property photo upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload property photo'
    })
  }
})




