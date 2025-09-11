<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form class="w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-semibold">Register</h1>
      <UInput v-model="fullName" type="text" placeholder="Full Name" required />
      <UInput v-model="email" type="email" placeholder="Email" required />
      <UInput v-model="password" type="password" placeholder="Password" required />
      <UButton type="submit" :loading="loading" block>Create account</UButton>
      <p class="text-sm">Already have an account? <NuxtLink class="underline" to="/auth/login">Login</NuxtLink></p>
    </form>
  </div>
</template>

<script setup lang="ts">
const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const auth = useAuthStore()

definePageMeta({ middleware: ['guest-only'] })

async function onSubmit() {
  loading.value = true
  try {
    const result = await auth.signUpWithEmail(email.value, password.value, fullName.value)
    if (result.user) {
      alert('Registration successful! Please check your email and click the confirmation link before logging in.')
      await navigateTo('/auth/login')
    }
  } catch (err: any) {
    console.error('Registration error:', err)
    if (err.message?.includes('User already registered')) {
      alert('This email is already registered. Please try logging in instead.')
    } else {
      alert('Registration failed: ' + (err.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}
</script>
