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
          <h2 class="text-3xl font-bold text-[#03045e] mb-2">Reset Password</h2>
          <p class="text-lg text-gray-600">
            Enter your new password (minimum 6 characters)
          </p>
        </div>

        <!-- Reset Password Form -->
        <div class="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form class="space-y-6" @submit.prevent="onSubmit">
            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <UInput 
                id="password"
                v-model="password" 
                type="password" 
                placeholder="Enter your new password" 
                required 
                class="w-full"
                @input="validatePassword"
              />
              <p class="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              <p v-if="passwordError" class="mt-1 text-xs text-red-600">{{ passwordError }}</p>
            </div>

            <!-- Confirm Password Field -->
            <div>
              <label for="passwordConfirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <UInput 
                id="passwordConfirmation"
                v-model="passwordConfirmation" 
                type="password" 
                placeholder="Confirm your new password" 
                required 
                class="w-full"
                @input="validatePassword"
              />
              <p v-if="passwordMatchError" class="mt-1 text-xs text-red-600">{{ passwordMatchError }}</p>
            </div>

            <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
            <p v-if="success" class="text-xs text-green-600">{{ success }}</p>

            <!-- Submit Button -->
            <div class="pt-4">
              <UButton 
                type="submit" 
                :loading="loading" 
                block 
                size="lg"
                class="w-full bg-[#03045e] hover:bg-[#03045e] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {{ loading ? 'Resetting...' : 'Reset Password' }}
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
  title: 'Reset Password',
  meta: [
    {
      name: 'description',
      content: 'Create a new secure password for your MySafeHouse account. Password must be at least 6 characters long.'
    }
  ]
})

const route = useRoute()
const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const passwordError = ref('')
const passwordMatchError = ref('')

// Get token from query params
const token = computed(() => route.query.token as string || '')

onMounted(() => {
  if (!token.value) {
    error.value = 'Invalid or missing reset token. Please request a new password reset link.'
  }
})

function validatePassword() {
  passwordError.value = ''
  passwordMatchError.value = ''

  const pwd = password.value?.trim() || ''
  const confirm = passwordConfirmation.value?.trim() || ''

  if (pwd && pwd.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long'
    return false
  }

  if (confirm && pwd !== confirm) {
    passwordMatchError.value = 'Passwords do not match'
    return false
  }

  return true
}

async function onSubmit() {
  if (!token.value) {
    error.value = 'Invalid or missing reset token. Please request a new password reset link.'
    return
  }

  const pwd = password.value?.trim() || ''
  const confirm = passwordConfirmation.value?.trim() || ''

  if (!validatePassword()) {
    return
  }

  if (!pwd || !confirm) {
    error.value = 'Please fill in all fields'
    return
  }

  if (pwd.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long'
    return
  }

  if (pwd !== confirm) {
    passwordMatchError.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: pwd,
        passwordConfirmation: confirm
      }
    })

    if (response.success) {
      success.value = 'Your password has been reset successfully. Redirecting to login...'
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 2000)
    } else {
      error.value = response.message || 'Failed to reset password. Please try again or request a new reset link.'
    }
  } catch (err: any) {
    console.error('Reset password error:', err)
    error.value = err.data?.message || err.message || 'An error occurred. Please try again or request a new reset link.'
  } finally {
    loading.value = false
  }
}
</script>

