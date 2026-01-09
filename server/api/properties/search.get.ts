import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { address, city, state, postal_code, country } = query

  if (!address) {
    return {
      success: false,
      message: 'Address is required for property search'
    }
  }

  const config = useRuntimeConfig()
  // Prefer service role key when available (production),
  // but gracefully fall back to public anon key (useful in local/dev)
  const supabaseKey = config.supabaseServiceRoleKey || config.public.supabaseKey

  if (!config.public.supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing for property search', {
      urlDefined: !!config.public.supabaseUrl,
      hasServiceRoleKey: !!config.supabaseServiceRoleKey,
      hasPublicKey: !!config.public.supabaseKey
    })
    return {
      success: false,
      message: 'Failed to search properties',
      properties: []
    }
  }

  const supabase = createClient(
    config.public.supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    console.log('Searching properties for:', { address, city, state, postal_code, country })

    // Build search query with multiple criteria
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
        property_type,
        emergency_access_enabled,
        created_at,
        updated_at
      `)
      .eq('emergency_access_enabled', true) // Only show properties with emergency access enabled

    // Flexible search - try multiple variations
    if (address) {
      // Extract key parts from the full address
      const addressParts = address.split(',').map(part => part.trim()).filter(part => part.length > 3)
      
      if (addressParts.length > 0) {
        const searchTerms = []
        
        // Add the first meaningful part
        searchTerms.push(addressParts[0])
        
        // Try to extract street name from the first part
        const firstPart = addressParts[0]
        const words = firstPart.split(' ').filter(word => word.length > 2)
        
        // Add individual words that might be street names
        words.forEach(word => {
          if (word.length > 3 && !word.match(/^\d+$/)) { // Not just numbers
            searchTerms.push(word)
          }
        })
        
        console.log('Search terms:', searchTerms)
        
        // Try each search term
        const conditions = searchTerms.map(term => `address.ilike.%${term}%`)
        if (conditions.length > 0) {
          searchQuery = searchQuery.or(conditions.join(','))
        }
      }
    }

    // Order by relevance (exact matches first, then partial matches)
    searchQuery = searchQuery.order('created_at', { ascending: false })

    const { data: properties, error } = await searchQuery

    if (error) {
      console.error('Property search error:', error)
      return {
        success: false,
        message: 'Failed to search properties',
        properties: []
      }
    }

    // Score and rank results by relevance
    const scoredProperties = (properties || []).map(property => {
      let score = 0

      // Exact matches get highest scores
      if (address && property.address?.toLowerCase().includes(String(address).toLowerCase())) {
        score += 10
      }
      if (city && property.city?.toLowerCase().includes(String(city).toLowerCase())) {
        score += 8
      }
      if (state && property.state?.toLowerCase().includes(String(state).toLowerCase())) {
        score += 6
      }
      if (postal_code && property.postal_code?.toLowerCase().includes(String(postal_code).toLowerCase())) {
        score += 5
      }
      if (country && property.country?.toLowerCase().includes(String(country).toLowerCase())) {
        score += 3
      }

      return {
        ...property,
        relevance_score: score
      }
    })

    // Sort by relevance score (highest first)
    const sortedProperties = scoredProperties.sort((a, b) => b.relevance_score - a.relevance_score)

    console.log(`Found ${sortedProperties.length} properties`)

    return {
      success: true,
      properties: sortedProperties,
      total: sortedProperties.length
    }
  } catch (error) {
    console.error('Property search error:', error)
    return {
      success: false,
      message: 'Failed to search properties',
      properties: []
    }
  }
})
