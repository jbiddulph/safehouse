<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
        <p class="mt-2 text-sm text-gray-600">
          Sign in to your SafeHouse account
        </p>
      </div>

      <!-- Login Form -->
      <div class="bg-white py-8 px-6 shadow-xl rounded-lg">
        <form class="space-y-6" @submit.prevent="onSubmit">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <UInput 
              id="email"
              v-model="email" 
              type="email" 
              placeholder="Enter your email" 
              required 
              class="w-full"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <UInput 
              id="password"
              v-model="password" 
              type="password" 
              placeholder="Enter your password" 
              required 
              class="w-full"
            />
          </div>


          <!-- Submit Button -->
          <div class="pt-4">
            <UButton 
              type="submit" 
              :loading="loading" 
              block 
              size="lg"
              class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </UButton>
          </div>

          <!-- Register Link -->
          <div class="text-center pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">
              Don't have an account? 
              <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Create one here
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>
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


