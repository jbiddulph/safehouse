<template>
  <div class="min-h-screen bg-[#f0f9fb] flex flex-col">
    <!-- Top Navigation -->
    <nav class="bg-[#03045e] shadow-lg border-b border-[#03045e]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-[#ffffff] rounded-lg flex items-center justify-center">
              <img src="/images/logo.png" alt="SafeHouse" class="h-full w-full object-cover" />
            </div>
            <NuxtLink to="/" class="text-2xl font-bold text-white">SafeHouse</NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full mx-auto">
        <div class="bg-white rounded-lg shadow-xl p-8 text-center">
          <div class="mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-[#03045e] mb-2">Payment Successful!</h2>
            <p class="text-gray-600">
              Your subscription has been activated. You can now start using SafeHouse.
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

// Verify payment with backend if needed
onMounted(async () => {
  if (sessionId) {
    // Optionally verify the session with the backend
    try {
      await $fetch('/api/stripe/verify-session', {
        method: 'POST',
        body: { sessionId }
      })
    } catch (error) {
      console.error('Session verification error:', error)
    }
  }
})
</script>

