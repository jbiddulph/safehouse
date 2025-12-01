export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = (query.q as string)?.trim()

  if (!searchTerm || searchTerm.length < 2) {
    return {
      success: true,
      suggestions: []
    }
  }

  const config = useRuntimeConfig()
  const googleApiKey = config.googleApiKey

  if (!googleApiKey) {
    return {
      success: false,
      message: 'Google API key not configured',
      suggestions: []
    }
  }

  try {
    console.log('Searching UK addresses for:', searchTerm)

    // Use Google Places Autocomplete API - better for address suggestions
    // Restrict to UK only using components parameter
    const autocompleteParams = new URLSearchParams({
      input: searchTerm,
      types: 'address', // Restrict to addresses only
      components: 'country:gb', // Restrict to United Kingdom only
      key: googleApiKey
    })

    const autocompleteResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${autocompleteParams.toString()}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!autocompleteResponse.ok) {
      throw new Error(`HTTP error! status: ${autocompleteResponse.status}`)
    }

    const autocompleteData = await autocompleteResponse.json()
    
    if (autocompleteData.status !== 'OK' && autocompleteData.status !== 'ZERO_RESULTS') {
      console.error('Google Places Autocomplete API error:', autocompleteData.status, autocompleteData.error_message)
      return {
        success: false,
        message: `Google Places API error: ${autocompleteData.error_message || autocompleteData.status}`,
        suggestions: []
      }
    }

    const predictions = autocompleteData.predictions || []
    console.log('Google Places Autocomplete results count:', predictions.length)
    
    // Get detailed information for each place
    const suggestions = await Promise.all(
      predictions.slice(0, 10).map(async (prediction: any) => {
        try {
          // Get detailed place information including address components
          const detailsParams = new URLSearchParams({
            place_id: prediction.place_id,
            fields: 'address_components,formatted_address,geometry',
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
              const address: any = {
                formatted_address: result.formatted_address || prediction.description,
                address: '',
                city: '',
                state: '',
                postcode: '',
                country: 'GB'
              }
              
              components.forEach((component: any) => {
                const types = component.types
                if (types.includes('street_number')) {
                  address.address = component.long_name
                }
                if (types.includes('route')) {
                  address.address = address.address 
                    ? `${address.address} ${component.long_name}` 
                    : component.long_name
                }
                if (types.includes('postal_code')) {
                  address.postcode = component.long_name
                }
                if (types.includes('locality') || types.includes('postal_town')) {
                  address.city = component.long_name
                }
                if (types.includes('administrative_area_level_1')) {
                  address.state = component.long_name
                }
                if (types.includes('country')) {
                  address.country = component.short_name || 'GB'
                }
              })

              // Build formatted address if not provided
              if (!address.address && address.city) {
                address.address = result.formatted_address || prediction.description
              }

              return {
                formatted_address: result.formatted_address || prediction.description,
                address: address.address || result.formatted_address || prediction.description,
                city: address.city,
                state: address.state,
                postcode: address.postcode,
                country: address.country || 'GB',
                lat: result.geometry?.location?.lat?.toString() || null,
                lon: result.geometry?.location?.lng?.toString() || null,
                place_id: prediction.place_id
              }
            }
          }
        } catch (detailError) {
          console.error('Error fetching place details:', detailError)
        }

        // Fallback to basic information if details fetch fails
        return {
          formatted_address: prediction.description,
          address: prediction.description,
          city: '',
          state: '',
          postcode: '',
          country: 'GB',
          lat: null,
          lon: null,
          place_id: prediction.place_id
        }
      })
    )

    // Filter out any null results from failed detail fetches
    const validSuggestions = suggestions.filter(s => s !== null && s !== undefined)
    
    console.log('Final UK address suggestions count:', validSuggestions.length)
    
    return {
      success: true,
      suggestions: validSuggestions
    }
  } catch (error) {
    console.error('Google Places API error:', error)
    return {
      success: false,
      message: 'Failed to fetch UK address suggestions',
      suggestions: []
    }
  }
})
