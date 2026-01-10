import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Lazy load Sharp inside the function to handle cases where it's not available
  let sharp: any = null
  try {
    const sharpModule = await import('sharp')
    sharp = sharpModule.default || sharpModule
  } catch (e) {
    console.warn('Sharp not available, will upload original images:', e)
    sharp = null
  }
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

    let processedImage: Buffer
    let fileExtension: string
    let contentType: string

    // Try to use Sharp for image processing, fallback to original if Sharp fails
    try {
      // Process image with Sharp: convert to WEBP, resize if needed, optimize
      processedImage = await sharp(buffer)
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ 
          quality: 85,
          effort: 6 
        })
        .toBuffer()
      
      fileExtension = 'webp'
      contentType = 'image/webp'
      console.log('Image processed successfully with Sharp, size reduced from', buffer.length, 'to', processedImage.length)
    } catch (sharpError: any) {
      console.warn('Sharp processing failed, using original image:', sharpError.message, sharpError.stack)
      // Fallback: use original image if Sharp fails
      processedImage = buffer
      fileExtension = file.name.split('.').pop() || 'jpg'
      contentType = file.type || 'image/jpeg'
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${propertyId}_${timestamp}.${fileExtension}`
    const filePath = `property/${fileName}`

    // Upload to Supabase Storage - use Buffer directly (Supabase accepts Buffer in Node.js)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('safehouse')
      .upload(filePath, processedImage, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to upload property image: ${uploadError.message}`
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
  } catch (error: any) {
    console.error('Property image upload error:', error)
    const errorMessage = error.message || 'Unknown error occurred'
    const errorStack = error.stack || ''
    console.error('Error details:', { message: errorMessage, stack: errorStack, name: error.name })
    
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to upload property image: ${errorMessage}`
    })
  }
})

