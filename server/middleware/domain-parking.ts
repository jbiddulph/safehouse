import { createClient } from '@supabase/supabase-js'

let maintenanceModeCache: { enabled: boolean; checkedAt: number } | null = null
const CACHE_TTL_MS = 5_000

async function isMaintenanceModeEnabled() {
  if (maintenanceModeCache && Date.now() - maintenanceModeCache.checkedAt < CACHE_TTL_MS) {
    return maintenanceModeCache.enabled
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

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  const maintenanceModeEnabled = await isMaintenanceModeEnabled()
  if (!maintenanceModeEnabled) {
    return
  }

  const isApiRoute = pathname.startsWith('/api/')
  const isStaticAsset = pathname.startsWith('/_nuxt/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(pathname)

  const isAllowedPath = pathname === '/coming-soon' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth/') ||
    pathname === '/auth'

  if (!isApiRoute && !isStaticAsset && !isAllowedPath) {
    return sendRedirect(event, '/coming-soon', 302)
  }
})
