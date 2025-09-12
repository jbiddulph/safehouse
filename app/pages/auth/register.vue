<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form class="w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-semibold">Register</h1>
      
      <!-- Avatar Upload -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Profile Picture (Optional)</label>
        <div class="flex items-center space-x-4">
          <div v-if="avatarPreview" class="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
            <img :src="avatarPreview" alt="Avatar preview" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              @change="onAvatarChange"
              class="hidden"
            />
            <UButton @click="$refs.avatarInput.click()" size="sm" variant="outline">
              {{ avatarFile ? 'Change' : 'Upload' }}
            </UButton>
            <UButton v-if="avatarFile" @click="removeAvatar" size="sm" color="red" variant="ghost">
              Remove
            </UButton>
          </div>
        </div>
      </div>
      
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
    const result = await auth.signUpWithEmail(email.value, password.value, fullName.value, avatarFile.value)
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
