import { createClient } from '@supabase/supabase-js'
import { normalizeBaseUrl } from './qr'

const PRIMARY_PUBLIC_BASE_URL = 'https://mysafehouse.co.uk'
const CACHE_TTL_MS = 5_000

let maintenanceModeCache: { enabled: boolean; checkedAt: number } | null = null

async function isMaintenanceModeEnabled() {
  if (maintenanceModeCache && Date.now() - maintenanceModeCache.checkedAt < CACHE_TTL_MS) {
    return maintenanceModeCache.enabled
  }

  const config = useRuntimeConfig()

  if (!config.public.supabaseUrl || !config.supabaseServiceRoleKey) {
    maintenanceModeCache = { enabled: false, checkedAt: Date.now() }
    return false
  }

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

  const { data, error } = await supabase
    .from('safehouse_settings')
    .select('setting_value')
    .eq('setting_key', 'maintenance_mode_enabled')
    .maybeSingle()

  if (error) {
    console.error('Failed to read maintenance mode setting:', error)
    maintenanceModeCache = { enabled: false, checkedAt: Date.now() }
    return false
  }

  const enabled = data?.setting_value === 'true'
  maintenanceModeCache = { enabled, checkedAt: Date.now() }
  return enabled
}

export async function resolvePublicBaseUrl() {
  const config = useRuntimeConfig()
  const maintenanceModeEnabled = await isMaintenanceModeEnabled()

  if (!maintenanceModeEnabled) {
    return PRIMARY_PUBLIC_BASE_URL
  }

  return normalizeBaseUrl(config.public.baseUrl || PRIMARY_PUBLIC_BASE_URL)
}
