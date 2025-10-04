<template>
  <div 
    ref="mapContainer" 
    class="w-32 h-20 bg-gray-100 rounded border"
    :class="{ 'cursor-pointer': hasCoordinates }"
      @click="handleMapClick"
  >
    <!-- Fallback content when no coordinates -->
    <div v-if="!hasCoordinates" class="flex items-center justify-center h-full text-xs text-gray-500">
      No location
    </div>
  </div>

  <!-- Full map modal -->
  <div 
    v-if="showFullMap" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="showFullMap = false"
  >
    <div class="bg-white rounded-lg p-4 max-w-2xl w-full mx-4" @click.stop>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Access Location</h3>
        <button 
          @click="showFullMap = false"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="space-y-2 mb-4">
        <p class="text-sm text-gray-600">
          <span class="font-medium">Country:</span> {{ country || 'Unknown' }}
        </p>
        <p class="text-sm text-gray-600">
          <span class="font-medium">Region:</span> {{ region || 'Unknown' }}
        </p>
        <p class="text-sm text-gray-600">
          <span class="font-medium">City:</span> {{ city || 'Unknown' }}
        </p>
        <p class="text-sm text-gray-600">
          <span class="font-medium">Coordinates:</span> {{ latitude }}, {{ longitude }}
        </p>
      </div>
      
      <div 
        ref="fullMapContainer" 
        class="w-full h-80 bg-gray-100 rounded border"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Client-side only component for Leaflet maps
definePageMeta({
  ssr: false
})

// Dynamic imports for client-side only
let L: any = null

onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
  }
})

interface Props {
  latitude?: number
  longitude?: number
  country?: string
  region?: string
  city?: string
  ipAddress?: string
}

const props = defineProps<Props>()

const mapContainer = ref<HTMLElement>()
const fullMapContainer = ref<HTMLElement>()
const showFullMap = ref(false)
let smallMap: L.Map | null = null
let fullMap: L.Map | null = null

const hasCoordinates = computed(() => {
  return props.latitude && props.longitude && 
         props.latitude !== 0 && props.longitude !== 0
})

// Handle map click
function handleMapClick() {
  if (hasCoordinates.value) {
    showFullMap.value = true
  }
}

// Initialize small map
onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    
    if (hasCoordinates.value && mapContainer.value) {
      initSmallMap()
    }
  }
})

// Initialize full map when modal opens
watch(showFullMap, async (newValue) => {
  if (newValue && hasCoordinates.value && fullMapContainer.value && process.client) {
    if (!L) {
      L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')
    }
    nextTick(() => {
      initFullMap()
    })
  }
})

// Cleanup maps on unmount
onUnmounted(() => {
  if (smallMap) {
    smallMap.remove()
  }
  if (fullMap) {
    fullMap.remove()
  }
})

function initSmallMap() {
  if (!mapContainer.value || !hasCoordinates.value || !L) return

  try {
    smallMap = L.map(mapContainer.value, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(smallMap)

    const marker = L.marker([props.latitude!, props.longitude!]).addTo(smallMap)
    
    // Set view to show the marker with some padding
    smallMap.setView([props.latitude!, props.longitude!], 10)
    
    // Add popup with basic info
    const popupContent = `
      <div class="text-xs">
        <div class="font-medium">${props.city || 'Unknown City'}</div>
        <div class="text-gray-600">${props.country || 'Unknown Country'}</div>
      </div>
    `
    marker.bindPopup(popupContent)
    
  } catch (error) {
    console.error('Error initializing small map:', error)
  }
}

function initFullMap() {
  if (!fullMapContainer.value || !hasCoordinates.value || !L) return

  try {
    fullMap = L.map(fullMapContainer.value)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(fullMap)

    const marker = L.marker([props.latitude!, props.longitude!]).addTo(fullMap)
    
    // Set view to show the marker with some padding
    fullMap.setView([props.latitude!, props.longitude!], 13)
    
    // Add detailed popup
    const popupContent = `
      <div class="text-sm">
        <div class="font-medium mb-2">Access Location</div>
        <div><strong>City:</strong> ${props.city || 'Unknown'}</div>
        <div><strong>Region:</strong> ${props.region || 'Unknown'}</div>
        <div><strong>Country:</strong> ${props.country || 'Unknown'}</div>
        <div><strong>Coordinates:</strong> ${props.latitude}, ${props.longitude}</div>
        ${props.ipAddress ? `<div><strong>IP:</strong> ${props.ipAddress}</div>` : ''}
      </div>
    `
    marker.bindPopup(popupContent).openPopup()
    
  } catch (error) {
    console.error('Error initializing full map:', error)
  }
}

// Cleanup when component is destroyed
onBeforeUnmount(() => {
  if (smallMap) {
    smallMap.remove()
    smallMap = null
  }
  if (fullMap) {
    fullMap.remove()
    fullMap = null
  }
})
</script>
