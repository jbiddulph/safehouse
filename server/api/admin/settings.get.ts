import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
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
    // Get all settings
    const { data: settings, error } = await supabase
      .from('safehouse_settings')
      .select('*')
      .order('setting_key', { ascending: true })

    if (error) {
      console.error('Error fetching settings:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch settings'
      })
    }

    // Convert array to object for easier access
    const settingsObject: Record<string, any> = {}
    settings?.forEach(setting => {
      settingsObject[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        id: setting.id
      }
    })

    return {
      success: true,
      settings: settingsObject
    }
  } catch (error) {
    console.error('Settings fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch settings'
    })
  }
})

