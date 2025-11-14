export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = query.q as string

  if (!searchTerm || searchTerm.length < 3) {
    return {
      success: false,
      message: 'Search term must be at least 3 characters'
    }
  }

  const config = useRuntimeConfig()
  const googleApiKey = config.googleApiKey

  if (!googleApiKey) {
    return {
      success: false,
      message: 'Google API key not configured'
    }
  }

  try {
    console.log('Searching Google Places for:', searchTerm)

    // Use Google Places API Text Search with correct fields
    // Restrict to UK only using components parameter
    const searchParams = new URLSearchParams({
      input: searchTerm,
      inputtype: 'textquery',
      fields: 'place_id,formatted_address,geometry,types',
      components: 'country:gb', // Restrict to United Kingdom
      key: googleApiKey
    })

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${searchParams.toString()}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message)
      return {
        success: false,
        message: `Google Places API error: ${data.error_message || data.status}`,
        suggestions: []
      }
    }

    console.log('Google Places results count:', data.candidates?.length || 0)
    
    // Get detailed information for each place
    const suggestions = await Promise.all(
      (data.candidates || []).map(async (place: any) => {
        try {
          // Get detailed place information including address components
          const detailsParams = new URLSearchParams({
            place_id: place.place_id,
            fields: 'address_components,formatted_address,geometry,types',
            key: googleApiKey
          })

          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?${detailsParams.toString()}`,
            {
              headers: {
                'Accept': 'application/json'
              }
            }
          )

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json()
            if (detailsData.status === 'OK' && detailsData.result) {
              const result = detailsData.result
              const components = result.address_components || []
              const address: any = {}
              
              components.forEach((component: any) => {
                const types = component.types
                if (types.includes('street_number')) address.house_number = component.long_name
                if (types.includes('route')) address.road = component.long_name
                if (types.includes('postal_code')) address.postcode = component.long_name
                if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                  address.city = component.long_name
                }
                if (types.includes('administrative_area_level_1')) address.state = component.long_name
                if (types.includes('country')) address.country = component.long_name
              })

              return {
                formatted_address: result.formatted_address || place.formatted_address,
                place_id: place.place_id,
                types: result.types || place.types || ['address'],
                lat: result.geometry?.location?.lat?.toString() || place.geometry?.location?.lat?.toString(),
                lon: result.geometry?.location?.lng?.toString() || place.geometry?.location?.lng?.toString(),
                house_number: address.house_number,
                road: address.road,
                postcode: address.postcode,
                city: address.city,
                state: address.state,
                country: address.country,
                full_address: result.formatted_address || place.formatted_address
              }
            }
          }
        } catch (detailError) {
          console.error('Error fetching place details:', detailError)
        }

        // Fallback to basic information if details fetch fails
        return {
          formatted_address: place.formatted_address,
          place_id: place.place_id,
          types: place.types || ['address'],
          lat: place.geometry?.location?.lat?.toString(),
          lon: place.geometry?.location?.lng?.toString(),
          house_number: null,
          road: null,
          postcode: null,
          city: null,
          state: null,
          country: null,
          full_address: place.formatted_address
        }
      })
    )

    console.log('Final suggestions count:', suggestions.length)
    
    return {
      success: true,
      suggestions
    }
  } catch (error) {
    console.error('Google Places API error:', error)
    return {
      success: false,
      message: 'Failed to fetch address suggestions from Google Places',
      suggestions: []
    }
  }
})
