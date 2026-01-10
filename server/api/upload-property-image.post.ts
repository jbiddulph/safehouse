import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

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

  // Increase file size limit to 20MB (will be compressed to WEBP)
  if (file.size > 20 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File size must be less than 20MB'
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
    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process image with Sharp: convert to WEBP, resize if needed, optimize
    const processedImage = await sharp(buffer)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality: 85,
        effort: 6 
      })
      .toBuffer()

    // Generate unique filename with .webp extension
    const timestamp = Date.now()
    const fileName = `${propertyId}_${timestamp}.webp`
    const filePath = `property/${fileName}`

    // Upload processed buffer directly to Supabase Storage
    // In Node.js, Supabase accepts Buffer directly, but we can also use Uint8Array
    // Convert Buffer to Uint8Array for better compatibility
    const uint8Array = new Uint8Array(processedImage)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('safehouse')
      .upload(filePath, uint8Array, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp'
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

