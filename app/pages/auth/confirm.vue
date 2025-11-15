<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md space-y-4 text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03045e] mx-auto"></div>
        <p>Confirming your email...</p>
      </div>
      <div v-else-if="success" class="space-y-4">
        <div class="text-[#8ee0ee] text-6xl">✓</div>
        <h1 class="text-2xl font-semibold text-[#8ee0ee]">Email Confirmed!</h1>
        <p>Your email has been successfully confirmed. You can now log in.</p>
        <UButton @click="goToLogin" color="primary" size="lg">Go to Login</UButton>
      </div>
      <div v-else class="space-y-4">
        <div class="text-red-600 text-6xl">✗</div>
        <h1 class="text-2xl font-semibold text-red-600">Confirmation Failed</h1>
        <p>{{ error || 'There was an error confirming your email. Please try again.' }}</p>
        <UButton @click="goToLogin" color="primary" size="lg">Go to Login</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const tokenHash = route.query.token_hash as string
    const type = route.query.type as string
    
    if (!tokenHash || type !== 'email') {
      throw new Error('Invalid confirmation link')
    }

    const client = useSupabaseClient()
    const { error: confirmError } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email'
    })

    if (confirmError) {
      throw confirmError
    }

    success.value = true
  } catch (err: any) {
    console.error('Confirmation error:', err)
    error.value = err.message || 'Unknown error'
  } finally {
    loading.value = false
  }
})

function goToLogin() {
  navigateTo('/auth/login')
}
</script>
