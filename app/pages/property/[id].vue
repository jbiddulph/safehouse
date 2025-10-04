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
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading property details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center">
          <div class="mb-4">
            <svg class="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
          <p class="text-sm text-gray-500 mb-6">
            The property you're looking for doesn't exist or you don't have access to it.
          </p>
          <NuxtLink 
            to="/" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </NuxtLink>
        </div>

        <!-- Property Details -->
        <div v-else-if="property" class="space-y-6">
          <!-- Property Header -->
          <div class="text-center">
            <div class="mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
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
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {{ property.property_type }}
            </span>
            <span 
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                property.emergency_access_enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              ]"
            >
              {{ property.emergency_access_enabled ? 'Emergency Access Available' : 'Emergency Access Disabled' }}
            </span>
          </div>

          <!-- QR Code Section -->
          <div v-if="property.qr_code" class="text-center">
            <h4 class="text-lg font-medium text-gray-900 mb-4">QR Code</h4>
            <div class="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              <div id="qr-code" class="w-48 h-48"></div>
            </div>
            <p class="text-sm text-gray-500 mt-2">Scan this QR code for quick access</p>
          </div>

          <!-- Access Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-lg font-medium text-gray-900 mb-3">Access Information</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Property ID:</span>
                <span class="font-mono text-gray-900">{{ property.id }}</span>
              </div>
              <div v-if="property.qr_code" class="flex justify-between">
                <span class="text-gray-600">QR Code:</span>
                <span class="font-mono text-gray-900">{{ property.qr_code }}</span>
              </div>
              <div v-if="property.nfc_id" class="flex justify-between">
                <span class="text-gray-600">NFC ID:</span>
                <span class="font-mono text-gray-900">{{ property.nfc_id }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button 
              v-if="property.emergency_access_enabled"
              @click="requestAccess"
              :disabled="requestingAccess"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ requestingAccess ? 'Requesting Access...' : 'Request Emergency Access' }}
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
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 v-if="!emailSent" class="text-lg font-medium text-gray-900 mb-2">Request Emergency Access</h3>
          <h3 v-else class="text-lg font-medium text-green-900 mb-2">Email Sent!</h3>
          
          <p v-if="!emailSent" class="text-sm text-gray-500 mb-6">
            Enter your email address to receive an access request link for {{ property?.property_name }}
          </p>
          <p v-else class="text-sm text-green-600 mb-6">
            We've sent an access request link to <strong>{{ emailForm.email }}</strong>. 
            Check your email and click the link to complete your request.
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
                :disabled="emailSending || !emailForm.email"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      // Generate QR code if property has QR code
      if (property.value.qr_code) {
        await generateQRCode(property.value.qr_code)
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

// Generate QR code
async function generateQRCode(qrData: string) {
  try {
    // Import QR code library dynamically
    const QRCode = await import('qrcode')
    
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement
    if (canvas) {
      await QRCode.toCanvas(canvas, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    }
  } catch (err) {
    console.error('Error generating QR code:', err)
  }
}

// Request emergency access
async function requestAccess() {
  if (!property.value) return
  
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
  
  emailSending.value = true
  try {
    const response = await $fetch('/api/access-requests/send-email', {
      method: 'POST',
      body: {
        email: emailForm.value.email,
        property_id: property.value.id
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

// Close email modal
function closeEmailModal() {
  showEmailModal.value = false
  emailSent.value = false
  emailForm.value.email = ''
}
</script>
