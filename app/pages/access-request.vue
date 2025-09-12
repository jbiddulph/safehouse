<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Emergency Access Request</h2>
        <p class="mt-2 text-sm text-gray-600">
          Scan QR code and enter your details to request access
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
              class="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process QR Code
            </button>
          </div>
        </div>

        <!-- Access Request Form -->
        <div v-else-if="!requestSubmitted" class="space-y-6">
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900">{{ scannedProperty.property_name }}</h3>
            <p class="text-sm text-gray-500">{{ scannedProperty.address }}</p>
          </div>

          <form @submit.prevent="submitAccessRequest" class="space-y-4">
            <!-- Contact Information -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                v-model="requestForm.requester_phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                v-model="requestForm.requester_email"
                type="email"
                placeholder="your@email.com"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                v-model="requestForm.requester_name"
                type="text"
                placeholder="Your full name"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <!-- Access Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Access Code</label>
              <input
                v-model="requestForm.access_code_entered"
                type="text"
                placeholder="Enter the access code"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Submitting...' : 'Request Access' }}
            </button>
          </form>
        </div>

        <!-- Verification Step -->
        <div v-else-if="!verificationSubmitted" class="space-y-6">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="mt-2 text-lg font-medium text-gray-900">Check Your Phone/Email</h3>
            <p class="text-sm text-gray-500">
              We've sent a verification code to {{ requestForm.requester_phone || requestForm.requester_email }}
            </p>
          </div>

          <form @submit.prevent="submitVerification" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Verification Code</label>
              <input
                v-model="verificationForm.verification_code"
                type="text"
                placeholder="Enter 6-digit code"
                maxlength="6"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-center text-lg tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="verifying"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ verifying ? 'Verifying...' : 'Verify Code' }}
            </button>
          </form>

          <div class="text-center">
            <button
              @click="resendCode"
              :disabled="resending"
              class="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              {{ resending ? 'Resending...' : 'Resend Code' }}
            </button>
          </div>
        </div>

        <!-- Success/Status -->
        <div v-else class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="mt-2 text-lg font-medium text-gray-900">Request Submitted</h3>
          <p class="text-sm text-gray-500">
            Your access request has been submitted and is being reviewed.
          </p>
          <p class="text-xs text-gray-400 mt-2">
            You will receive a notification once approved.
          </p>
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
const verificationSubmitted = ref(false)
const submitting = ref(false)
const verifying = ref(false)
const resending = ref(false)
const manualQrCode = ref('')

// Form data
const requestForm = ref({
  requester_phone: '',
  requester_email: '',
  requester_name: '',
  access_code_entered: ''
})

const verificationForm = ref({
  verification_code: ''
})

const accessRequest = ref(null)

// Process QR code (simulate scanning)
function processQrCode(qrCode: string) {
  if (!qrCode) return
  
  // In a real app, this would decode the QR code to get property info
  // For now, we'll simulate with a test property
  scannedProperty.value = {
    id: 'test-property-id',
    property_name: 'Test Property',
    address: '123 Test Street, Test City, TS 12345'
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
        requester_phone: requestForm.value.requester_phone,
        requester_email: requestForm.value.requester_email,
        requester_name: requestForm.value.requester_name,
        access_code_entered: requestForm.value.access_code_entered,
        ip_address: '127.0.0.1', // In real app, get from request
        user_agent: navigator.userAgent,
        location_data: null // In real app, get GPS coordinates
      }
    })
    
    if (response.success) {
      accessRequest.value = response.request
      requestSubmitted.value = true
    }
  } catch (error) {
    console.error('Failed to submit access request:', error)
    alert('Failed to submit access request: ' + (error.data?.message || error.message))
  } finally {
    submitting.value = false
  }
}

// Submit verification code
async function submitVerification() {
  if (!accessRequest.value) return
  
  verifying.value = true
  
  try {
    const response = await $fetch('/api/access-requests/verify', {
      method: 'POST',
      body: {
        verification_token: accessRequest.value.verification_token,
        verification_code: verificationForm.value.verification_code
      }
    })
    
    if (response.success) {
      verificationSubmitted.value = true
    }
  } catch (error) {
    console.error('Failed to verify code:', error)
    alert('Failed to verify code: ' + (error.data?.message || error.message))
  } finally {
    verifying.value = false
  }
}

// Resend verification code
async function resendCode() {
  // TODO: Implement resend functionality
  resending.value = true
  setTimeout(() => {
    resending.value = false
    alert('Verification code resent!')
  }, 1000)
}
</script>
