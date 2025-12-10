<template>
  <div class="min-h-screen bg-[#f0f9fb] flex flex-col">
    <!-- Top Navigation -->
    <nav class="bg-[#03045e] shadow-lg border-b border-[#03045e]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Title -->
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0 flex items-center space-x-3">
              <div class="h-8 w-8 bg-[#ffffff] rounded-lg flex items-center justify-center">
                <img src="/images/logo.png" alt="SafeHouse" class="h-full w-full object-cover" />
              </div>
              <NuxtLink to="/" class="text-2xl font-bold text-white">SafeHouse</NuxtLink>
            </div>
            
            <!-- Navigation Menu -->
            <nav class="hidden md:flex items-center space-x-6">
              <NuxtLink to="/about" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                About Us
              </NuxtLink>
              <NuxtLink to="/how-it-works" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                How It Works
              </NuxtLink>
              <NuxtLink to="/privacy-policy" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                Privacy Policy
              </NuxtLink>
              <NuxtLink to="/terms" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                Terms & Conditions
              </NuxtLink>
            </nav>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/auth/login" 
              class="text-sm font-medium text-white border-b-2 border-[#8ee0ee] pb-1"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/auth/register" 
              class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors"
            >
              Sign Up
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full mx-auto space-y-8">
        <!-- Header Text -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-[#03045e] mb-2">Welcome back</h2>
          <p class="text-lg text-gray-600">
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
              class="w-full bg-[#03045e] hover:bg-[#03045e] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </UButton>
          </div>

          <!-- Register Link -->
          <div class="text-center pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">
              Don't have an account? 
              <NuxtLink to="/auth/register" class="font-medium text-[#8ee0ee] hover:text-[#8ee0ee]0 transition-colors">
                Create one here
              </NuxtLink>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-[#03045e] border-t border-[#03045e] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-center">
          <p class="text-sm text-[#8ee0ee]">
            Copyright © 2025 SafeHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
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


