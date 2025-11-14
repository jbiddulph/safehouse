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
    // Get distance tolerance setting
    const { data: setting, error } = await supabase
      .from('safehouse_settings')
      .select('setting_value')
      .eq('setting_key', 'location_verification_distance_meters')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching distance tolerance setting:', error)
      // Return default if error (except not found)
      return {
        success: true,
        distanceToleranceMeters: 50
      }
    }

    // If setting not found, return default
    if (!setting) {
      return {
        success: true,
        distanceToleranceMeters: 50
      }
    }

    const distanceTolerance = parseInt(setting.setting_value, 10)
    
    // Validate the value
    if (isNaN(distanceTolerance) || distanceTolerance < 1) {
      console.warn('Invalid distance tolerance value, using default of 50 meters')
      return {
        success: true,
        distanceToleranceMeters: 50
      }
    }

    return {
      success: true,
      distanceToleranceMeters: distanceTolerance
    }
  } catch (error) {
    console.error('Distance tolerance fetch error:', error)
    // Return default on any error
    return {
      success: true,
      distanceToleranceMeters: 50
    }
  }
})

