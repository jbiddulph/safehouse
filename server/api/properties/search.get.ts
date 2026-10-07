import { createClient } from '@supabase/supabase-js'
import { consumeRateLimit } from '../../utils/rate-limit'

const MIN_QUERY_LENGTH = 3
const MAX_QUERY_LENGTH = 120
const MAX_RESULTS = 8
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000

/** Escape characters that are special in Postgres ILIKE patterns. */
function escapeIlike(value: string): string {
  return value.replace(/([\\%_])/g, '\\$1')
}

function clientKey(event: any): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) return String(forwarded).split(',')[0].trim()
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}

/**
 * Public property search used by the homepage autocomplete.
 * Returns only the minimum fields needed to identify and open a property.
 * Enforces query length, result caps, and basic rate limiting to reduce bulk enumeration.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawAddress = typeof query.address === 'string' ? query.address.trim() : ''
  const city = typeof query.city === 'string' ? query.city.trim() : ''
  const state = typeof query.state === 'string' ? query.state.trim() : ''
  const postalCode = typeof query.postal_code === 'string' ? query.postal_code.trim() : ''
  const country = typeof query.country === 'string' ? query.country.trim() : ''

  if (!rawAddress || rawAddress.length < MIN_QUERY_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Address must be at least ${MIN_QUERY_LENGTH} characters`
    })
  }

  if (rawAddress.length > MAX_QUERY_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Address must be at most ${MAX_QUERY_LENGTH} characters`
    })
  }

  const rate = consumeRateLimit(`properties-search:${clientKey(event)}`, RATE_LIMIT, RATE_WINDOW_MS)
  setHeader(event, 'X-RateLimit-Limit', String(RATE_LIMIT))
  setHeader(event, 'X-RateLimit-Remaining', String(rate.remaining))
  setHeader(event, 'Cache-Control', 'no-store')

  if (!rate.allowed) {
    setHeader(event, 'Retry-After', String(rate.retryAfterSec))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many search requests. Please try again shortly.'
    })
  }

  const config = useRuntimeConfig()
  // Service role is used so emergency_access_enabled filtering works reliably.
  // Only a minimized public projection is returned below.
  const supabaseKey = config.supabaseServiceRoleKey || config.public.supabaseKey

  if (!config.public.supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing for property search', {
      urlDefined: !!config.public.supabaseUrl,
      hasServiceRoleKey: !!config.supabaseServiceRoleKey,
      hasPublicKey: !!config.public.supabaseKey
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to search properties'
    })
  }

  const supabase = createClient(config.public.supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    const escapedAddress = escapeIlike(rawAddress)

    // Prefer matching against the full typed query; avoid OR-ing common short words
    // that would enumerate large sets (e.g. "Road", "Street").
    let searchQuery = supabase
      .from('safehouse_properties')
      .select(`
        id,
        property_name,
        address,
        city,
        state,
        postal_code,
        country,
        property_type
      `)
      .eq('emergency_access_enabled', true)
      .ilike('address', `%${escapedAddress}%`)
      .limit(MAX_RESULTS)

    if (city) {
      searchQuery = searchQuery.ilike('city', `%${escapeIlike(city)}%`)
    }
    if (state) {
      searchQuery = searchQuery.ilike('state', `%${escapeIlike(state)}%`)
    }
    if (postalCode) {
      searchQuery = searchQuery.ilike('postal_code', `%${escapeIlike(postalCode)}%`)
    }
    if (country) {
      searchQuery = searchQuery.ilike('country', `%${escapeIlike(country)}%`)
    }

    const { data: properties, error } = await searchQuery

    if (error) {
      console.error('Property search error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to search properties'
      })
    }

    const scored = (properties || []).map((property) => {
      let score = 0
      const addressLower = property.address?.toLowerCase() || ''
      const queryLower = rawAddress.toLowerCase()

      if (addressLower === queryLower) score += 20
      else if (addressLower.startsWith(queryLower)) score += 12
      else if (addressLower.includes(queryLower)) score += 8

      if (city && property.city?.toLowerCase().includes(city.toLowerCase())) score += 5
      if (postalCode && property.postal_code?.toLowerCase().includes(postalCode.toLowerCase())) score += 5

      return { property, score }
    })

    scored.sort((a, b) => b.score - a.score)

    // Public projection only — no created_at/updated_at/emergency flags/scores
    const publicProperties = scored.slice(0, MAX_RESULTS).map(({ property }) => ({
      id: property.id,
      property_name: property.property_name,
      address: property.address,
      city: property.city,
      state: property.state,
      postal_code: property.postal_code,
      country: property.country,
      property_type: property.property_type
    }))

    return {
      success: true,
      properties: publicProperties,
      // Reflect returned page size only (do not expose full match cardinality)
      count: publicProperties.length,
      capped: true
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Property search error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to search properties'
    })
  }
})
