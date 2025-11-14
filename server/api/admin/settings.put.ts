import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { setting_key, setting_value, description } = body

  if (!setting_key || setting_value === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'setting_key and setting_value are required'
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
    // Check if setting exists
    const { data: existingSetting } = await supabase
      .from('safehouse_settings')
      .select('id')
      .eq('setting_key', setting_key)
      .single()

    let result
    if (existingSetting) {
      // Update existing setting
      const updateData: any = {
        setting_value: String(setting_value),
        updated_at: new Date().toISOString()
      }
      if (description !== undefined) {
        updateData.description = description
      }

      const { data, error } = await supabase
        .from('safehouse_settings')
        .update(updateData)
        .eq('setting_key', setting_key)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new setting
      const { data, error } = await supabase
        .from('safehouse_settings')
        .insert({
          setting_key,
          setting_value: String(setting_value),
          description: description || null
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return {
      success: true,
      setting: result
    }
  } catch (error) {
    console.error('Settings update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update setting'
    })
  }
})

