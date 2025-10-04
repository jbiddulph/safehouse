<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Enter Access Code</h2>
        <p class="mt-2 text-sm text-gray-600">
          Please enter the access code you received via email
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Property Information -->
        <div v-if="propertyInfo" class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 class="text-lg font-medium text-blue-900 mb-2">Property Information</h3>
          <p class="text-sm text-blue-800 font-medium">{{ propertyInfo.property_name }}</p>
          <p class="text-sm text-blue-700">{{ propertyInfo.address }}</p>
        </div>

        <!-- Access Code Form -->
        <form v-if="!domainAllowed" @submit.prevent="verifyAccessCode" class="space-y-4">
          <div>
            <label for="access_code" class="block text-sm font-medium text-gray-700">
              Access Code *
            </label>
            <input
              id="access_code"
              v-model="accessCode"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono text-lg tracking-widest"
              placeholder="Enter access code"
              maxlength="8"
              @input="formatAccessCode"
            />
            <p class="mt-1 text-xs text-gray-500">
              Enter the 8-character code from your email
            </p>
          </div>

          <button
            type="submit"
            :disabled="verifying || !accessCode"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ verifying ? 'Verifying...' : 'Verify Access Code' }}
          </button>
        </form>

        <!-- Success Message -->
        <div v-if="verificationSuccess || domainAllowed" class="mt-6 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="mt-2 text-lg font-medium text-gray-900">Access Granted!</h3>
          <p v-if="domainAllowed" class="text-sm text-gray-500 mt-2">
            Your email domain is authorized for emergency access to this property.
          </p>
          <p v-else class="text-sm text-gray-500 mt-2">
            Your access request has been verified and approved.
          </p>
          <p class="text-xs text-gray-400 mt-2">
            The property owner has been notified of your access.
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="verificationError" class="mt-4 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="mt-2 text-lg font-medium text-gray-900">Verification Failed</h3>
          <p class="text-sm text-gray-500 mt-2">{{ verificationError }}</p>
          <button
            @click="resetForm"
            class="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
          >
            Try Again
          </button>
        </div>

        <div v-if="!domainAllowed" class="mt-6 text-center">
          <button
            @click="goBackToQRScan"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to QR Code Scan
          </button>
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
const accessCode = ref('')
const verifying = ref(false)
const verificationSuccess = ref(false)
const verificationError = ref('')
const propertyInfo = ref(null)
const domainAllowed = ref(false)

// Format access code input (uppercase, alphanumeric only)
function formatAccessCode(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (value.length > 8) {
    value = value.substring(0, 8)
  }
  accessCode.value = value
  target.value = value
}

// Verify access code
async function verifyAccessCode() {
  if (!accessCode.value) return
  
  verifying.value = true
  verificationError.value = ''
  
  try {
    const route = useRoute()
    const propertyId = route.query.property as string
    
    if (!propertyId) {
      throw new Error('Property ID is missing')
    }

    const response = await $fetch('/api/access-codes/validate', {
      method: 'POST',
      body: {
        accessCode: accessCode.value,
        propertyId: propertyId,
        usedByName: 'QR Code User',
        usedByContact: 'qr-scan@safehouse.app',
        accessMethod: 'QR_SCAN_VERIFIED',
        locationData: null
      }
    })
    
    if (response.success && response.valid) {
      verificationSuccess.value = true
      
      // Update the access request status to approved
      try {
        await $fetch('/api/access-requests/approve', {
          method: 'POST',
          body: {
            requestId: route.query.requestId as string,
            action: 'approve'
          }
        })
      } catch (error) {
        console.error('Failed to update request status:', error)
        // Don't fail the verification if status update fails
      }
      
      // Log access granted
      const { logAccessGranted } = useAccessLogger()
      await logAccessGranted(propertyId)
    } else {
      // Log access denied
      const { logAccessDenied } = useAccessLogger()
      await logAccessDenied(propertyId)
      
      verificationError.value = response.message || 'Invalid access code'
    }
  } catch (error) {
    console.error('Failed to verify access code:', error)
    verificationError.value = 'Failed to verify access code. Please try again.'
  } finally {
    verifying.value = false
  }
}

// Reset form
function resetForm() {
  accessCode.value = ''
}

// Check if access is granted via domain allowance
onMounted(() => {
  const route = useRoute()
  if (route.query.domain_allowed === 'true') {
    domainAllowed.value = true
    // Load property info if available
    if (route.query.property) {
      loadPropertyInfo(route.query.property as string)
    }
  }
})

// Load property information
async function loadPropertyInfo(propertyId: string) {
  try {
    const response = await $fetch(`/api/properties/${propertyId}`)
    if (response.success && response.property) {
      propertyInfo.value = response.property
    }
  } catch (error) {
    console.error('Failed to load property info:', error)
  }
}

// Go back to QR scan
function goBackToQRScan() {
  navigateTo('/qr-scan')
}

// Load property info on mount
onMounted(async () => {
  const route = useRoute()
  const propertyId = route.query.property as string
  
  if (propertyId) {
    try {
      const response = await $fetch(`/api/properties/${propertyId}`)
      if (response.success) {
        propertyInfo.value = response.property
      }
    } catch (error) {
      console.error('Failed to load property info:', error)
    }
  }
})
</script>
