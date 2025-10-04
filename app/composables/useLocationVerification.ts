export const useLocationVerification = () => {
  const isGeolocationSupported = ref(false)
  const locationPermission = ref<'granted' | 'denied' | 'prompt' | null>(null)
  const userLocation = ref<{ latitude: number; longitude: number } | null>(null)
  const locationError = ref<string | null>(null)
  const isGettingLocation = ref(false)

  // Check if geolocation is supported
  const checkGeolocationSupport = () => {
    isGeolocationSupported.value = 'geolocation' in navigator
    return isGeolocationSupported.value
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000 // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in meters
  }

  // Check if user is within specified distance of property
  const isWithinProximity = (
    userLat: number, 
    userLon: number, 
    propertyLat: number, 
    propertyLon: number, 
    maxDistanceMeters: number = 50
  ): boolean => {
    const distance = calculateDistance(userLat, userLon, propertyLat, propertyLon)
    return distance <= maxDistanceMeters
  }

  // Request location permission and get current position
  const requestLocationPermission = async (): Promise<boolean> => {
    if (!checkGeolocationSupport()) {
      locationError.value = 'Geolocation is not supported by this browser'
      return false
    }

    isGettingLocation.value = true
    locationError.value = null

    try {
      // Check if we already have permission
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        locationPermission.value = permissionStatus.state as any
        
        if (permissionStatus.state === 'denied') {
          locationError.value = 'Location permission denied. Please enable location access in your browser settings.'
          return false
        }
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Cache for 1 minute
          }
        )
      })

      userLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }

      locationPermission.value = 'granted'
      return true

    } catch (error: any) {
      console.error('Error getting location:', error)
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationPermission.value = 'denied'
          locationError.value = 'Location access denied. Please allow location access to verify your proximity to the property.'
          break
        case error.POSITION_UNAVAILABLE:
          locationError.value = 'Location information unavailable. Please check your device location settings.'
          break
        case error.TIMEOUT:
          locationError.value = 'Location request timed out. Please try again.'
          break
        default:
          locationError.value = 'Unable to get your location. Please try again.'
          break
      }
      
      return false
    } finally {
      isGettingLocation.value = false
    }
  }

  // Verify user is at the property location
  const verifyLocationAtProperty = async (
    propertyLat: number, 
    propertyLon: number, 
    maxDistanceMeters: number = 50
  ): Promise<{
    isVerified: boolean
    distance: number | null
    userLocation: { latitude: number; longitude: number } | null
    error: string | null
  }> => {
    const hasPermission = await requestLocationPermission()
    
    if (!hasPermission || !userLocation.value) {
      return {
        isVerified: false,
        distance: null,
        userLocation: null,
        error: locationError.value
      }
    }

    const distance = calculateDistance(
      userLocation.value.latitude,
      userLocation.value.longitude,
      propertyLat,
      propertyLon
    )

    const isVerified = distance <= maxDistanceMeters

    return {
      isVerified,
      distance,
      userLocation: userLocation.value,
      error: null
    }
  }

  return {
    isGeolocationSupported,
    locationPermission,
    userLocation,
    locationError,
    isGettingLocation,
    checkGeolocationSupport,
    calculateDistance,
    isWithinProximity,
    requestLocationPermission,
    verifyLocationAtProperty
  }
}
