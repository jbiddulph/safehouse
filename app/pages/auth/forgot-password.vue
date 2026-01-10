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
                <img src="/images/logo.png" alt="MySafeHouse" class="h-full w-full object-cover" />
              </div>
              <NuxtLink to="/" class="text-xl font-bold text-white">MySafeHouse</NuxtLink>
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
              class="text-sm font-medium text-[#8ee0ee] hover:text-white no-underline hover:no-underline transition-colors"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/auth/register" 
              class="text-sm font-medium text-[#8ee0ee] hover:text-white no-underline hover:no-underline transition-colors"
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
          <h2 class="text-3xl font-bold text-[#03045e] mb-2">Forgotten Password</h2>
          <p class="text-lg text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <!-- Forgot Password Form -->
        <div class="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form class="space-y-6" @submit.prevent="onSubmit">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <UInput 
                id="email"
                v-model="email" 
                type="email" 
                placeholder="Enter your email address" 
                required 
                class="w-full"
              />
              <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
              <p v-if="success" class="mt-1 text-xs text-green-600">{{ success }}</p>
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
                {{ loading ? 'Sending...' : 'Send Reset Link' }}
              </UButton>
            </div>

            <!-- Back to Login Link -->
            <div class="text-center pt-4 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                Remember your password? 
                <NuxtLink to="/auth/login" class="font-medium text-[#8ee0ee] hover:text-[#8ee0ee]0 transition-colors">
                  Sign in here
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
            Copyright © 2025 MySafeHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['guest-only'],
  title: 'Forgotten Password',
  meta: [
      {
        name: 'description',
        content: 'Reset your MySafeHouse password by entering your email address. We will send you a secure link to create a new password.'
      }
  ]
})

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

async function onSubmit() {
  if (!email.value || !email.value.trim()) {
    error.value = 'Please enter your email address'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email: email.value.trim()
      }
    })

    if (response.success) {
      success.value = 'If an account exists with this email address, you will receive a password reset link shortly. Please check your email inbox.'
      email.value = ''
    } else {
      error.value = response.message || 'Failed to send reset link. Please try again.'
    }
  } catch (err: any) {
    console.error('Forgot password error:', err)
    error.value = err.data?.message || err.message || 'An error occurred. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

