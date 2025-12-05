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
              <NuxtLink to="/" class="text-2xl font-bold text-white">MySafeHouse</NuxtLink>
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
              class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/auth/register" 
              class="text-sm font-medium text-white border-b-2 border-[#8ee0ee] pb-1"
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
          <h2 class="text-3xl font-bold text-[#03045e] mb-2">Create your account</h2>
          <p class="text-lg text-gray-600">
            Join MySafeHouse to manage your properties and access requests
          </p>
        </div>

        <!-- Registration Form -->
        <div class="bg-white py-8 px-6 shadow-xl rounded-lg">
        <form class="space-y-6" @submit.prevent="onSubmit">
          <!-- Avatar Upload Section -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Profile Picture</label>
            <div class="flex items-center space-x-4">
              <div v-if="avatarPreview" class="w-20 h-20 rounded-full overflow-hidden border-4 border-[#8ee0ee] shadow-lg">
                <img :src="avatarPreview" alt="Avatar preview" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-[#f0f9fb] flex items-center justify-center border-4 border-[#8ee0ee]">
                <svg class="w-10 h-10 text-[#8ee0ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="space-y-2">
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  @change="onAvatarChange"
                  class="hidden"
                />
                <UButton @click="$refs.avatarInput.click()" size="sm" variant="outline" class="w-full">
                  {{ avatarFile ? 'Change Photo' : 'Upload Photo' }}
                </UButton>
                <UButton v-if="avatarFile" @click="removeAvatar" size="sm" color="red" variant="ghost" class="w-full">
                  Remove
                </UButton>
              </div>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <UInput 
                id="fullName"
                v-model="fullName" 
                type="text" 
                placeholder="Enter your full name" 
                required 
                class="w-full"
              />
            </div>

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

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
              <UInput 
                id="phone"
                v-model="phone" 
                type="tel" 
                placeholder="Enter your mobile number" 
                required 
                class="w-full"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <UInput 
                id="password"
                v-model="password" 
                type="password" 
                placeholder="Create a secure password" 
                required 
                class="w-full"
              />
            </div>
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
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </UButton>
          </div>

          <!-- Login Link -->
          <div class="text-center pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">
              Already have an account? 
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
const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const loading = ref(false)
const auth = useAuthStore()

// Avatar upload state
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)


definePageMeta({ middleware: ['guest-only'] })


function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }
    
    avatarFile.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeAvatar() {
  avatarFile.value = null
  avatarPreview.value = null
  // Reset file input
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
}

async function onSubmit() {
  loading.value = true
  try {
    const result = await auth.signUpWithEmail(email.value, password.value, fullName.value, phone.value, avatarFile.value)
    if (result.user) {
      // Check if user needs email confirmation
      if (result.user.email_confirmed_at) {
        // User is already confirmed, redirect to dashboard
        alert('Registration successful! You are now logged in.')
        await navigateTo('/dashboard')
      } else {
        // User needs email confirmation
        alert('Registration successful! Please check your email and click the confirmation link before logging in.')
        await navigateTo('/auth/login')
      }
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
