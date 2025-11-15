import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export const useMapbox = () => {
  const config = useRuntimeConfig()
  const mapboxToken = config.public.mapboxApiKey

  if (!mapboxToken) {
    console.warn('Mapbox API key not configured')
  }

  // Initialize a map
  const initMap = (
    container: HTMLElement | string,
    options: {
      center?: [number, number]
      zoom?: number
      onMapClick?: (lng: number, lat: number) => void
      touchZoomRotate?: boolean
      touchPitch?: boolean
      doubleClickZoom?: boolean
      dragRotate?: boolean
      dragPan?: boolean
      scrollZoom?: boolean
      boxZoom?: boolean
      keyboard?: boolean
      attributionControl?: boolean
    } = {}
  ): mapboxgl.Map | null => {
    if (!mapboxToken) {
      console.error('Mapbox API key is required')
      return null
    }

    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      return null
    }

    mapboxgl.accessToken = mapboxToken

    const mapElement = typeof container === 'string' 
      ? document.getElementById(container) 
      : container

    if (!mapElement) {
      console.error('Map container not found')
      return null
    }

    // Ensure container has dimensions and is visible (critical for mobile)
    if (mapElement instanceof HTMLElement) {
      // Force explicit dimensions and visibility for mobile
      mapElement.style.display = 'block'
      mapElement.style.visibility = 'visible'
      mapElement.style.position = 'relative'
      
      // Ensure minimum dimensions
      if (!mapElement.style.height || mapElement.style.height === '0px' || mapElement.style.height === 'auto') {
        const computedHeight = window.getComputedStyle(mapElement).height
        if (!computedHeight || computedHeight === '0px' || computedHeight === 'auto') {
          mapElement.style.minHeight = '256px'
          mapElement.style.height = '256px'
        }
      }
      
      if (!mapElement.style.width || mapElement.style.width === '0px') {
        mapElement.style.width = '100%'
      }
      
      // Force a reflow to ensure styles are applied
      void mapElement.offsetHeight
      
      const rect = mapElement.getBoundingClientRect()
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       rect.top < window.innerHeight && 
                       rect.bottom > 0
      
      if (!isVisible || rect.width === 0 || rect.height === 0) {
        console.warn('Map container has no dimensions or is not visible, setting defaults')
        mapElement.style.minHeight = '256px'
        mapElement.style.height = '256px'
        mapElement.style.width = '100%'
        // Force another reflow
        void mapElement.offsetHeight
      }
    }

    const map = new mapboxgl.Map({
      container: mapElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: options.center || [-2.2374, 53.4808], // Default to Manchester, UK
      zoom: options.zoom || 13,
      // Interaction options (defaults to enabled unless explicitly disabled)
      touchZoomRotate: options.touchZoomRotate !== false,
      touchPitch: options.touchPitch !== false,
      doubleClickZoom: options.doubleClickZoom !== false,
      dragRotate: options.dragRotate !== false,
      dragPan: options.dragPan !== false,
      scrollZoom: options.scrollZoom !== false,
      boxZoom: options.boxZoom !== false,
      keyboard: options.keyboard !== false,
      attributionControl: options.attributionControl !== false,
      // Mobile-specific optimizations
      antialias: true,
      preserveDrawingBuffer: false
    })

    // Ensure map canvas has proper styling for mobile
    map.on('style.load', () => {
      const canvas = map.getCanvasContainer()
      if (canvas) {
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        const canvasElement = canvas.querySelector('canvas')
        if (canvasElement) {
          canvasElement.style.width = '100%'
          canvasElement.style.height = '100%'
          canvasElement.style.display = 'block'
        }
      }
    })

    // Resize map after load to ensure proper rendering on mobile
    map.on('load', () => {
      // Use requestAnimationFrame for better mobile rendering
      requestAnimationFrame(() => {
        map.resize()
        // Additional resize after a short delay for mobile
        setTimeout(() => {
          map.resize()
        }, 100)
      })
    })

    // Also resize on container resize (for responsive layouts)
    if (typeof ResizeObserver !== 'undefined' && mapElement instanceof HTMLElement) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            requestAnimationFrame(() => {
              if (map) {
                map.resize()
              }
            })
          }
        }
      })
      resizeObserver.observe(mapElement)
    }
    
    // Additional mobile-specific resize triggers
    if (typeof window !== 'undefined') {
      // Resize on orientation change
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          if (map) {
            map.resize()
          }
        }, 100)
      })
      
      // Resize on window resize (for mobile browser chrome changes)
      let resizeTimeout: NodeJS.Timeout
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          if (map) {
            map.resize()
          }
        }, 150)
      })
    }

    // Add click handler if provided (works for both mouse and touch)
    if (options.onMapClick) {
      map.on('click', (e) => {
        options.onMapClick!(e.lngLat.lng, e.lngLat.lat)
      })
    }

    return map
  }

  // Add a marker to the map
  const addMarker = (
    map: mapboxgl.Map,
    lng: number,
    lat: number,
    options: {
      draggable?: boolean
      onDragEnd?: (lng: number, lat: number) => void
    } = {}
  ): mapboxgl.Marker | null => {
    const marker = new mapboxgl.Marker({
      draggable: options.draggable || false
    })
      .setLngLat([lng, lat])
      .addTo(map)

    if (options.draggable && options.onDragEnd) {
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        options.onDragEnd!(lngLat.lng, lngLat.lat)
      })
    }

    return marker
  }

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lng: number, lat: number): Promise<any> => {
    if (!mapboxToken) {
      throw new Error('Mapbox API key is required')
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&country=gb&types=address,poi`
      )
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const context = feature.context || []
        
        // Extract address components
        let address = feature.place_name || feature.text || ''
        let city = ''
        let state = ''
        let postcode = ''
        let country = 'GB'

        context.forEach((item: any) => {
          if (item.id.startsWith('place')) {
            city = item.text
          } else if (item.id.startsWith('region')) {
            state = item.text
          } else if (item.id.startsWith('postcode')) {
            postcode = item.text
          } else if (item.id.startsWith('country')) {
            country = item.short_code?.toUpperCase() || 'GB'
          }
        })

        // Try to get full address from properties
        const properties = feature.properties || {}
        if (properties.address) {
          address = `${properties.address}, ${address}`
        }

        return {
          formatted_address: address,
          address: properties.address || address.split(',')[0] || '',
          city: city,
          state: state,
          postcode: postcode,
          country: country,
          lat: lat.toString(),
          lon: lng.toString()
        }
      }

      return null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      throw error
    }
  }

  // Create a small static map image URL
  const getStaticMapUrl = (
    lng: number,
    lat: number,
    width: number = 200,
    height: number = 150,
    zoom: number = 15
  ): string => {
    if (!mapboxToken) {
      return ''
    }

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/${width}x${height}@2x?access_token=${mapboxToken}`
  }

  return {
    initMap,
    addMarker,
    reverseGeocode,
    getStaticMapUrl,
    mapboxToken
  }
}

