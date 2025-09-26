<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Join SafeHouse to manage your properties and access requests
        </p>
      </div>

      <!-- Registration Form -->
      <div class="bg-white py-8 px-6 shadow-xl rounded-lg">
        <form class="space-y-6" @submit.prevent="onSubmit">
          <!-- Avatar Upload Section -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Profile Picture</label>
            <div class="flex items-center space-x-4">
              <div v-if="avatarPreview" class="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg">
                <img :src="avatarPreview" alt="Avatar preview" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center border-4 border-indigo-200">
                <svg class="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </UButton>
          </div>

          <!-- Login Link -->
          <div class="text-center pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">
              Already have an account? 
              <NuxtLink to="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in here
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>
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
