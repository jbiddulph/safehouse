<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md space-y-4">
      <h1 class="text-2xl font-semibold">Profile</h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading profile...</p>
      </div>
      
      <!-- Profile Content -->
      <div v-else>
        <!-- Avatar Section -->
        <div class="rounded border p-4 space-y-4">
        <div class="flex items-center space-x-4">
          <div v-if="avatarUrl" class="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
            <img :src="avatarUrl" alt="Profile picture" class="w-full h-full object-cover" />
          </div>
            <div v-else class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <UButton @click="$refs.avatarInput.click()" size="sm" variant="outline">
                {{ avatarFile ? 'Change Avatar' : 'Upload Avatar' }}
              </UButton>
              <UButton v-if="avatarUrl" @click="removeAvatar" size="sm" color="red" variant="ghost">
                Remove Avatar
              </UButton>
            </div>
          </div>

          <!-- Signed in as + Dashboard button inside the same box -->
          <div class="pt-2 mt-2 border-t">
            <p class="text-sm text-gray-600">Signed in as</p>
            <p class="font-medium">{{ profile?.full_name || user?.email }}</p>
            <p class="text-sm text-gray-600">{{ user?.email }}</p>
            <UButton class="mt-3" color="primary" @click="navigateTo('/dashboard')">
              Go to Dashboard
            </UButton>
          </div>
          
          <!-- Avatar Preview -->
          <div v-if="avatarPreview" class="space-y-2">
            <p class="text-sm font-medium">Preview:</p>
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
              <img :src="avatarPreview" alt="Avatar preview" class="w-full h-full object-cover" />
            </div>
            <div class="flex space-x-2">
              <UButton @click="saveAvatar" size="sm" :loading="uploading">
                Save Avatar
              </UButton>
              <UButton @click="cancelAvatar" size="sm" variant="ghost">
                Cancel
              </UButton>
            </div>
          </div>
        </div>
        
        <UButton color="red" @click="onLogout">Logout</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const auth = useAuthStore()
const user = computed(() => auth.user?.value || null)
const profile = ref(null)
const loading = ref(true)

// Computed property to ensure avatar URL has timestamp for cache busting
const avatarUrl = computed(() => {
  if (!profile.value?.avatar_url) return null
  
  // If URL already has a timestamp, return as is
  if (profile.value.avatar_url.includes('?t=')) {
    return profile.value.avatar_url
  }
  
  // Add timestamp to prevent caching
  const timestamp = new Date().getTime()
  return `${profile.value.avatar_url}?t=${timestamp}`
})

// Avatar upload state
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const uploading = ref(false)

// Watch for user changes and load profile when user becomes available
watch(user, async (newUser) => {
  if (newUser) {
    profile.value = await auth.getProfile()
    loading.value = false
  } else {
    profile.value = null
    loading.value = false
  }
}, { immediate: true })

onMounted(async () => {
  // Check session directly first
  const client = useSupabaseClient()
  const { data: { session } } = await client.auth.getSession()
  
  if (!session) {
    await navigateTo('/auth/login')
    return
  }
  
  // If user is available in reactive state, use it
  if (user.value) {
    profile.value = await auth.getProfile()
  } else {
    // Use session user directly to fetch profile
    try {
      const { data, error } = await client
        .from('safehouse_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        profile.value = null
      } else {
        profile.value = data
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
      profile.value = null
    }
  }
  
  loading.value = false
})

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

function cancelAvatar() {
  avatarFile.value = null
  avatarPreview.value = null
  // Reset file input
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
}

async function saveAvatar() {
  if (!avatarFile.value) return
  
  uploading.value = true
  try {
    // Get user ID from session since reactive user might be null
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    
    if (!session) {
      alert('No valid session found')
      return
    }
    
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)
    formData.append('userId', session.user.id)

    const result = await $fetch('/api/upload-avatar', {
      method: 'POST',
      body: formData
    })

    if (result.success) {
      // Add timestamp to prevent caching issues
      const timestamp = new Date().getTime()
      const avatarUrlWithTimestamp = `${result.url}?t=${timestamp}`
      
      // Update profile with new avatar URL
      const { error } = await client
        .from('safehouse_profiles')
        .update({ avatar_url: avatarUrlWithTimestamp })
        .eq('id', session.user.id)

      if (error) {
        console.error('Profile update error:', error)
        alert('Failed to update profile')
      } else {
        // Refresh profile data
        profile.value = await auth.getProfile()
        avatarFile.value = null
        avatarPreview.value = null
        alert('Avatar updated successfully!')
      }
    }
  } catch (error) {
    console.error('Avatar upload error:', error)
    alert('Failed to upload avatar')
  } finally {
    uploading.value = false
  }
}

async function removeAvatar() {
  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    
    if (!session) {
      alert('No valid session found')
      return
    }
    
    const { error } = await client
      .from('safehouse_profiles')
      .update({ avatar_url: null })
      .eq('id', session.user.id)

    if (error) {
      console.error('Profile update error:', error)
      alert('Failed to remove avatar')
    } else {
      // Refresh profile data
      profile.value = await auth.getProfile()
      alert('Avatar removed successfully!')
    }
  } catch (error) {
    console.error('Avatar removal error:', error)
    alert('Failed to remove avatar')
  }
}

async function onLogout() {
  try {
    await auth.signOut()
    await navigateTo('/auth/login')
  } catch (err) {
    console.error(err)
  }
}
</script>
