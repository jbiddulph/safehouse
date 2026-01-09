<template>
  <div class="min-h-screen bg-[#f0f9fb] flex flex-col">
    <!-- Top Navigation -->
    <nav class="bg-[#03045e] shadow-lg border-b border-[#03045e]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-[#ffffff] rounded-lg flex items-center justify-center">
              <img src="/images/logo.png" alt="MySafeHouse" class="h-full w-full object-cover" />
            </div>
            <NuxtLink to="/" class="text-2xl font-bold text-white">MySafeHouse</NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full mx-auto">
        <div class="bg-white rounded-lg shadow-xl p-8 text-center">
          <div class="mb-6">
            <div v-if="verifying" class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="verificationError" class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div v-else class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-[#03045e] mb-2">
              <span v-if="verifying">Verifying Payment...</span>
              <span v-else-if="verificationError">Payment Verification Issue</span>
              <span v-else>Payment Successful!</span>
            </h2>
            <p v-if="verifying" class="text-gray-600">
              Please wait while we verify your payment...
            </p>
            <p v-else-if="verificationError" class="text-red-600 mb-4">
              {{ verificationError }}
            </p>
            <p v-else class="text-gray-600">
              Your subscription has been activated. You can now start using MySafeHouse.
            </p>
          </div>

          <div class="space-y-4">
            <UButton 
              to="/dashboard"
              size="lg"
              class="w-full bg-[#03045e] hover:bg-[#03045e] text-white font-semibold py-3 px-4 rounded-lg"
            >
              Go to Dashboard
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sessionId = route.query.session_id as string
const verifying = ref(false)
const verificationError = ref<string | null>(null)
const verified = ref(false)

// Verify payment with backend (only once)
onMounted(async () => {
  // Check if already verified (prevent loop)
  if (verified.value || !sessionId) return
  
  // Check localStorage to prevent re-verification
  const verificationKey = `payment_verified_${sessionId}`
  if (localStorage.getItem(verificationKey)) {
    verified.value = true
    return
  }

  verifying.value = true
  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    
    if (!session) {
      verificationError.value = 'Please log in to verify your payment'
      verifying.value = false
      return
    }

    const result = await $fetch('/api/stripe/verify-payment', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${session.access_token}`
      },
      body: { sessionId }
    })

    if (result.success) {
      // Payment verified and subscription activated
      console.log('Payment verified successfully:', result)
      verified.value = true
      // Mark as verified in localStorage to prevent re-verification
      localStorage.setItem(verificationKey, 'true')
      
      // Check if user has any properties
      try {
        const { properties } = await $fetch('/api/properties', {
          headers: {
            authorization: `Bearer ${session.access_token}`
          }
        })
        
        // Navigate to dashboard with flag to show property form if no properties
        const hasProperties = properties && properties.length > 0
        setTimeout(() => {
          navigateTo(hasProperties ? '/dashboard' : '/dashboard?addFirstProperty=true')
        }, 2000)
      } catch (error) {
        // If check fails, just navigate to dashboard
        setTimeout(() => {
          navigateTo('/dashboard?addFirstProperty=true')
        }, 2000)
      }
    } else {
      verificationError.value = result.message || 'Payment verification failed'
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    verificationError.value = error.data?.message || error.message || 'Failed to verify payment'
  } finally {
    verifying.value = false
  }
})
</script>

