<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Emergency Access Request</h2>
        <p class="mt-2 text-sm text-gray-600">
          Scan QR code and enter your email to request access
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- QR Code Scanner -->
        <div v-if="!scannedProperty" class="text-center">
          <div class="mb-6">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h3>
          <p class="text-sm text-gray-500 mb-6">
            Use your camera to scan the QR code on the property
          </p>
          
          <!-- QR Code Input (for testing) -->
          <div class="mt-4">
            <label for="qr-input" class="block text-sm font-medium text-gray-700">
              Or enter QR code manually:
            </label>
            <input
              id="qr-input"
              v-model="manualQrCode"
              type="text"
              placeholder="Enter QR code"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              @keyup.enter="processQrCode(manualQrCode)"
            />
            <button
              @click="processQrCode(manualQrCode)"
              :disabled="!manualQrCode"
              class="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process QR Code
            </button>
          </div>
        </div>

        <!-- Property Info and Email Form -->
        <div v-else-if="!requestSubmitted" class="space-y-6">
          <!-- Property Information -->
          <div class="bg-primary-50 border border-primary-200 rounded-md p-4">
            <h3 class="text-lg font-medium text-primary-900 mb-2">Property Information</h3>
            <p class="text-sm text-primary-800 font-medium">{{ scannedProperty.property_name }}</p>
            <p class="text-sm text-primary-700">{{ scannedProperty.address }}</p>
          </div>

          <!-- Email Form -->
          <form @submit.prevent="submitAccessRequest" class="space-y-4">
            <div>
              <label for="requester_email" class="block text-sm font-medium text-gray-700">
                Your Email Address *
              </label>
              <input
                id="requester_email"
                v-model="requestForm.requester_email"
                type="email"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label for="requester_name" class="block text-sm font-medium text-gray-700">
                Your Name (Optional)
              </label>
              <input
                id="requester_name"
                v-model="requestForm.requester_name"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your name"
              />
            </div>

            <div class="bg-primary-50 border border-primary-200 rounded-md p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-primary-800">
                    Access Code Information
                  </h3>
                  <div class="mt-2 text-sm text-primary-700">
                    <p>After submitting your request, you will receive an email with the access code for this property.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              :disabled="submitting || !requestForm.requester_email"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Submitting Request...' : 'Request Access Code' }}
            </button>
          </form>

          <div class="text-center">
            <button
              @click="resetForm"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Scan Different QR Code
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div v-else class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="mt-2 text-lg font-medium text-gray-900">Access Code Sent!</h3>
          <p class="text-sm text-gray-500 mt-2">
            We've sent you an email with the access code for this property.
          </p>
          <p class="text-xs text-gray-400 mt-2">
            Please check your email and use the access code to complete your request.
          </p>
          <div class="mt-4">
            <button
              @click="resetForm"
              class="text-sm text-primary-600 hover:text-primary-500"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest-only'
})

// Reactive data
const scannedProperty = ref(null)
const requestSubmitted = ref(false)
const submitting = ref(false)
const manualQrCode = ref('')

// Form data
const requestForm = ref({
  requester_email: '',
  requester_name: ''
})

// Process QR code (simulate scanning)
async function processQrCode(qrCode: string) {
  if (!qrCode) return
  
  try {
    // Extract property ID from QR code
    // QR codes should contain URLs like: https://safehouse.app/qr-scan?property=PROPERTY_ID
    const url = new URL(qrCode)
    const propertyId = url.searchParams.get('property')
    
    if (!propertyId) {
      throw new Error('Invalid QR code format')
    }

    // Fetch property details
    const response = await $fetch(`/api/properties/${propertyId}`)
    
    if (response.success) {
      scannedProperty.value = response.property
    } else {
      throw new Error(response.message || 'Property not found')
    }
  } catch (error) {
    console.error('QR code processing error:', error)
    alert('Failed to process QR code: ' + (error.message || 'Invalid QR code'))
  }
}

// Submit access request
async function submitAccessRequest() {
  if (!scannedProperty.value) return
  
  submitting.value = true
  
  try {
    const response = await $fetch('/api/access-requests/create', {
      method: 'POST',
      body: {
        property_id: scannedProperty.value.id,
        requester_email: requestForm.value.requester_email,
        requester_name: requestForm.value.requester_name,
        ip_address: '127.0.0.1', // In real app, get from request
        user_agent: navigator.userAgent,
        location_data: null // In real app, get GPS coordinates
      }
    })
    
    if (response.success) {
      // Redirect to access code verification page
      const route = useRoute()
      const propertyId = route.query.property || scannedProperty.value?.id
      const requestId = response.request?.id
      
      await navigateTo(`/access-code-verification?property=${propertyId}&requestId=${requestId}`)
    }
  } catch (error) {
    console.error('Failed to submit access request:', error)
    alert('Failed to submit access request: ' + (error.data?.message || error.message))
  } finally {
    submitting.value = false
  }
}

// Reset form
function resetForm() {
  scannedProperty.value = null
  requestSubmitted.value = false
  requestForm.value = {
    requester_email: '',
    requester_name: ''
  }
  manualQrCode.value = ''
}

// Handle URL parameters on page load
onMounted(() => {
  const route = useRoute()
  const propertyId = route.query.property as string
  
  if (propertyId) {
    // Auto-process if property ID is in URL
    processQrCode(`https://safehouse.app/qr-scan?property=${propertyId}`)
  }
})
</script>
