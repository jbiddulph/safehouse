<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form class="w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-semibold">Login</h1>
      <UInput v-model="email" type="email" placeholder="Email" required />
      <UInput v-model="password" type="password" placeholder="Password" required />
      <UButton type="submit" :loading="loading" block>Sign in</UButton>
      <p class="text-sm">No account? <NuxtLink class="underline" to="/auth/register">Register</NuxtLink></p>
    </form>
  </div>
  </template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const auth = useAuthStore()

definePageMeta({ middleware: ['guest-only'] })

async function onSubmit() {
  loading.value = true
  try {
    await auth.signInWithEmail(email.value, password.value)
    await navigateTo('/profile')
  } catch (err: any) {
    console.error('Login error:', err)
    if (err.message?.includes('Invalid login credentials')) {
      alert('Invalid email or password. If you just registered, please check your email and click the confirmation link first.')
    } else if (err.message?.includes('Email not confirmed')) {
      alert('Please check your email and click the confirmation link before logging in.')
    } else {
      alert('Login failed: ' + (err.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}
</script>


