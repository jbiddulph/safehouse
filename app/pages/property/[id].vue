<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Property Details</h2>
        <p class="mt-2 text-sm text-gray-600">
          View property information and access details
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03045e] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading property details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center">
          <div class="mb-4">
            <Icon name="mdi:alert" class="mx-auto h-16 w-16 text-red-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
          <p class="text-sm text-gray-500 mb-6">
            The property you're looking for doesn't exist or you don't have access to it.
          </p>
          <NuxtLink 
            to="/" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#03045e] hover:bg-[#03045e]"
          >
            <Icon name="mdi:arrow-left" class="-ml-1 mr-2 h-4 w-4" />
            Back to Home
          </NuxtLink>
        </div>

        <!-- Property Details -->
        <div v-else-if="property" class="space-y-6">
          <!-- Property Header -->
          <div class="text-center">
            <div class="mb-4">
              <div class="w-16 h-16 bg-[#f0f9fb] rounded-full flex items-center justify-center mx-auto">
                <Icon name="mdi:home" class="w-8 h-8 text-[#8ee0ee]" />
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ property.property_name }}</h3>
            <p class="text-gray-600 mt-1">{{ property.address }}</p>
            <p class="text-sm text-gray-500">
              {{ property.city }}{{ property.state ? `, ${property.state}` : '' }} {{ property.postal_code || '' }}
            </p>
            <p class="text-sm text-gray-500">{{ property.country }}</p>
          </div>

          <!-- Property Type & Status -->
          <div class="flex justify-center space-x-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#f0f9fb] text-[#03045e]">
              {{ property.property_type }}
            </span>
            <span 
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                property.emergency_access_enabled 
                  ? 'bg-[#f0f9fb] text-[#03045e]' 
                  : 'bg-red-100 text-red-800'
              ]"
            >
              {{ property.emergency_access_enabled ? 'Emergency Access Available' : 'Emergency Access Disabled' }}
            </span>
          </div>

          <!-- Property Map -->
          <div v-if="hasValidCoordinates(property)" class="mt-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Property Location</h4>
            <div
              ref="propertyMapContainer"
              class="w-full h-64 rounded-lg border border-gray-300 overflow-hidden"
              style="min-height: 256px; width: 100%; position: relative;"
            ></div>
            <p class="mt-2 text-xs text-gray-500 text-center">
              {{ property.address }}, {{ property.city }}{{ property.state ? `, ${property.state}` : '' }}
            </p>
          </div>
          <div v-else class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600 text-center">
              <Icon name="mdi:map-marker" class="inline-block w-5 h-5 mr-1 text-gray-400" />
              Location coordinates not available for this property
            </p>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button 
              v-if="property.emergency_access_enabled"
              @click="requestAccess('emergency')"
              :disabled="requestingAccess"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ requestingAccess ? 'Requesting Access...' : 'Request Emergency Access' }}
            </button>
            
            <button 
              @click="requestAccess('standard')"
              :disabled="requestingAccess"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#03045e] hover:bg-[#03045e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ requestingAccess ? 'Requesting Access...' : 'Request Standard Access' }}
            </button>
            
            <NuxtLink 
              to="/" 
              class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Home
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Collection Modal -->
    <div v-if="showEmailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button @click="closeEmailModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <Icon name="mdi:close" class="h-6 w-6" />
        </button>
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
               :class="accessType === 'emergency' ? 'bg-red-100' : 'bg-[#f0f9fb]'">
            <Icon name="mdi:alert" 
                 :class="accessType === 'emergency' ? 'text-red-600' : 'text-[#8ee0ee]'"
                 class="h-6 w-6" />
          </div>
          
          <h3 v-if="!emailSent" class="text-lg font-medium text-gray-900 mb-2">
            Request {{ accessType === 'emergency' ? 'Emergency' : 'Standard' }} Access
          </h3>
          <h3 v-else class="text-lg font-medium text-[#03045e] mb-2">Email Sent!</h3>
          
          <p v-if="!emailSent" class="text-sm text-gray-500 mb-6">
            Enter your email address so we can alert the property owner of your {{ accessType === 'emergency' ? 'emergency' : 'standard' }} access request for {{ property?.property_name }}.
            <span v-if="accessType === 'emergency'">We'll also verify you're at the property location for security.</span>
          </p>
          <p v-else class="text-sm text-[#8ee0ee] mb-6">
            We've notified the property owner. Please wait for them to approve your {{ accessType === 'emergency' ? 'emergency' : 'standard' }} access request for {{ property?.property_name }}.
          </p>
        </div>

        <div v-if="!emailSent">
          <form @submit.prevent="sendAccessRequestEmail" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                v-model="emailForm.email"
                type="email"
                placeholder="your@email.com"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <!-- Location Verification (Required for Emergency Access) -->
            <div v-if="accessType === 'emergency'" class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700">
                  Location Verification
                </label>
                <button
                  type="button"
                  @click="verifyLocation"
                  :disabled="isVerifyingLocation || !emailForm.email"
                  class="px-3 py-1 text-xs font-medium rounded-md border transition-colors"
                  :class="{
                    'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100': !locationVerification.isVerified,
                    'border-[#8ee0ee] text-[#8ee0ee] bg-[#f0f9fb]': locationVerification.isVerified,
                    'border-red-300 text-red-700 bg-red-50': locationVerification.error,
                    'opacity-50 cursor-not-allowed': isVerifyingLocation || !emailForm.email
                  }"
                >
                  {{ getLocationButtonText() }}
                </button>
              </div>
              
              <!-- Location Status -->
              <div class="text-xs">
                <div v-if="locationVerification.isVerified" class="text-[#8ee0ee] flex items-center">
                  <Icon name="mdi:check-circle" class="w-4 h-4 mr-1" />
                  Verified at property (within {{ locationVerification.distance?.toFixed(0) }}m)
                </div>
                <div v-else-if="locationVerification.error" class="text-red-600 flex items-center">
                  <Icon name="mdi:alert-circle" class="w-4 h-4 mr-1" />
                  {{ locationVerification.error }}
                </div>
                <div v-else class="text-gray-500">
                  Click "Verify Location" to confirm you're at the property
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeEmailModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="emailSending || !emailForm.email || (accessType === 'emergency' && !locationVerification.isVerified)"
                class="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                :class="accessType === 'emergency' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#03045e] hover:bg-[#03045e]'"
              >
                {{ emailSending ? 'Sending...' : 'Send Access Request' }}
              </button>
            </div>
          </form>
        </div>

        <div v-else class="text-center">
          <button
            @click="closeEmailModal"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page as public - no auth required
definePageMeta({
  auth: false
})

// Get property ID from route
const route = useRoute()
const propertyId = route.params.id as string

// Reactive data
const property = ref(null)
const loading = ref(true)
const error = ref(false)
const requestingAccess = ref(false)
const showEmailModal = ref(false)
const emailForm = ref({
  email: ''
})
const emailSending = ref(false)
const emailSent = ref(false)
const accessType = ref<'emergency' | 'standard'>('emergency')

// Location verification
const { verifyLocationAtProperty } = useLocationVerification()
const isVerifyingLocation = ref(false)
const locationVerification = ref({
  isVerified: false,
  distance: null as number | null,
  userLocation: null as { latitude: number; longitude: number } | null,
  error: null as string | null
})

// Map for property location
const propertyMapContainer = ref<HTMLElement | null>(null)
const propertyMap = ref<any>(null)
const propertyMapMarker = ref<any>(null)

// Load property details
onMounted(async () => {
  await loadProperty()
})

async function loadProperty() {
  try {
    loading.value = true
    error.value = false
    
    const response = await $fetch(`/api/properties/${propertyId}`)
    
    if (response.success && response.property) {
      property.value = response.property
      
      // Log property view
      const { logPropertyView } = useAccessLogger()
      await logPropertyView(propertyId, response.property.property_name)
      
      // Initialize map if coordinates are available
      if (hasValidCoordinates(property.value)) {
        await nextTick()
        setTimeout(() => {
          initPropertyMap()
        }, 100)
      }
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Error loading property:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// Check if property has valid coordinates
function hasValidCoordinates(property: any): boolean {
  if (!property) return false
  
  // Handle both string and number types, and Decimal types from database
  const lat = property.latitude != null ? parseFloat(String(property.latitude)) : NaN
  const lng = property.longitude != null ? parseFloat(String(property.longitude)) : NaN
  
  return !isNaN(lat) && !isNaN(lng) && lat !== null && lng !== null && 
         lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Initialize property map
function initPropertyMap() {
  if (!propertyMapContainer.value || !property.value) return
  
  const lat = parseFloat(String(property.value.latitude))
  const lng = parseFloat(String(property.value.longitude))
  
  if (isNaN(lat) || isNaN(lng)) return
  
  // Ensure we're on client side and container is visible
  if (typeof window === 'undefined') return
  
  // Ensure container is visible and has dimensions
  const container = propertyMapContainer.value
  if (container instanceof HTMLElement) {
    container.style.display = 'block'
    container.style.visibility = 'visible'
    container.style.position = 'relative'
  }
  
  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    if (!propertyMapContainer.value) return
    
    // Use requestAnimationFrame for better mobile rendering
    requestAnimationFrame(() => {
      if (!propertyMapContainer.value) return
      
      const { initMap, addMarker } = useMapbox()
      
      // Initialize map centered on property location
      propertyMap.value = initMap(propertyMapContainer.value, {
        center: [lng, lat],
        zoom: 15
      })
      
      // Add marker at property location
      if (propertyMap.value) {
        propertyMapMarker.value = addMarker(propertyMap.value, lng, lat, {
          draggable: false
        })
        
        // Force resize multiple times to ensure mobile rendering
        requestAnimationFrame(() => {
          if (propertyMap.value) {
            propertyMap.value.resize()
          }
        })
        
        setTimeout(() => {
          if (propertyMap.value) {
            propertyMap.value.resize()
          }
        }, 100)
        
        setTimeout(() => {
          if (propertyMap.value) {
            propertyMap.value.resize()
          }
        }, 500)
      }
    })
  })
}

// Cleanup map on unmount
onUnmounted(() => {
  if (propertyMapMarker.value) {
    propertyMapMarker.value.remove()
    propertyMapMarker.value = null
  }
  if (propertyMap.value) {
    propertyMap.value.remove()
    propertyMap.value = null
  }
})

// Request access (emergency or standard)
async function requestAccess(type: 'emergency' | 'standard') {
  if (!property.value) return
  
  accessType.value = type
  requestingAccess.value = true
  try {
    // Check if user is logged in
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user?.email) {
      // User is logged in, pre-fill email and show modal
      emailForm.value.email = session.user.email
    }
    
    // Show email collection modal
    showEmailModal.value = true
  } catch (err) {
    console.error('Error requesting access:', err)
    // On error, show modal anyway
    showEmailModal.value = true
  } finally {
    requestingAccess.value = false
  }
}

// Send access request email
async function sendAccessRequestEmail() {
  if (!emailForm.value.email || !property.value) return
  // Location verification required only for emergency access
  if (accessType.value === 'emergency' && !locationVerification.value.isVerified) return
  
  emailSending.value = true
  try {
    const response = await $fetch('/api/access-requests/send-email', {
      method: 'POST',
      body: {
        email: emailForm.value.email,
        property_id: property.value.id,
        access_type: accessType.value, // 'emergency' or 'standard'
        location_verified: accessType.value === 'emergency' ? locationVerification.value.isVerified : false,
        user_location: locationVerification.value.userLocation,
        distance_from_property: locationVerification.value.distance
      }
    })
    
    if (response.success) {
      emailSent.value = true
      
      // Log emergency request
      const { logEmergencyRequest } = useAccessLogger()
      await logEmergencyRequest(property.value.id, emailForm.value.email, emailForm.value.phoneNumber)
    } else {
      alert('Failed to send access request email: ' + (response.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error sending access request email:', error)
    alert('Failed to send access request email: ' + (error.message || 'Network error'))
  } finally {
    emailSending.value = false
  }
}

// Verify user location at property
async function verifyLocation() {
  if (!property.value || !property.value.latitude || !property.value.longitude) {
    locationVerification.value.error = 'Property location not available'
    return
  }

  isVerifyingLocation.value = true
  locationVerification.value.error = null

  try {
    // Fetch distance tolerance from settings
    let distanceTolerance = 50 // Default fallback
    try {
      const settingsResponse = await $fetch('/api/settings/get-distance-tolerance')
      if (settingsResponse.success) {
        distanceTolerance = settingsResponse.distanceToleranceMeters
      }
    } catch (settingsError) {
      console.warn('Failed to fetch distance tolerance setting, using default:', settingsError)
      // Use default value
    }

    const result = await verifyLocationAtProperty(
      property.value.latitude,
      property.value.longitude,
      distanceTolerance
    )

    locationVerification.value = result
  } catch (error) {
    console.error('Location verification error:', error)
    locationVerification.value.error = 'Failed to verify location. Please try again.'
  } finally {
    isVerifyingLocation.value = false
  }
}

// Get location button text
function getLocationButtonText(): string {
  if (isVerifyingLocation.value) return 'Verifying...'
  if (locationVerification.value.isVerified) return 'Verified ✓'
  if (locationVerification.value.error) return 'Retry'
  return 'Verify Location'
}

// Close email modal
function closeEmailModal() {
  showEmailModal.value = false
  emailSent.value = false
  emailForm.value.email = ''
  accessType.value = 'emergency' // Reset to default
  // Reset location verification
  locationVerification.value = {
    isVerified: false,
    distance: null,
    userLocation: null,
    error: null
  }
}
</script>
