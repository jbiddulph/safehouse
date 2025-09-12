import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId } = body

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing userId'
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
    // Get the user's profile to find the avatar
    const { data: profile, error: profileError } = await supabase
      .from('safehouse_profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.avatar_url) {
      return { success: true, message: 'No avatar to delete' }
    }

    // Extract the file path from the URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/safehouse/avatar/[filename]
    const url = new URL(profile.avatar_url)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(-2).join('/') // Gets "avatar/filename.ext"

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from('safehouse')
      .remove([filePath])

    if (deleteError) {
      console.error('Avatar deletion error:', deleteError)
      return { success: false, error: deleteError.message }
    }

    return { success: true, message: 'Avatar deleted successfully' }
  } catch (error) {
    console.error('Avatar cleanup error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to cleanup avatar'
    })
  }
})
