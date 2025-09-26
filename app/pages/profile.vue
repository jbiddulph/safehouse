<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 class="mt-6 text-3xl font-bold text-gray-900">Your Profile</h1>
        <p class="mt-2 text-sm text-gray-600">Manage your account details and avatar</p>
      </div>

      <!-- Card -->
      <div class="bg-white shadow-xl rounded-lg p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading profile...</p>
        </div>

        <!-- Profile Content -->
        <div v-else class="space-y-8">
          <!-- Top: Avatar + Basic Info -->
          <div class="flex items-center gap-5">
            <div class="relative">
              <div v-if="avatarUrl" class="w-20 h-20 rounded-full overflow-hidden ring-2 ring-indigo-200">
                <img :src="avatarUrl" alt="Profile picture" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-indigo-200">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-900">{{ profile?.full_name || 'Your name' }}</h2>
              <p class="text-sm text-gray-600">{{ user?.email }}</p>
              <div class="mt-3 flex gap-2">
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
          </div>

          <!-- Avatar Preview -->
          <div v-if="avatarPreview" class="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <p class="text-sm font-medium text-indigo-900">Preview</p>
            <div class="mt-2 flex items-center gap-3">
              <div class="w-16 h-16 rounded-full overflow-hidden ring-2 ring-indigo-200">
                <img :src="avatarPreview" alt="Avatar preview" class="w-full h-full object-cover" />
              </div>
              <div class="flex gap-2">
                <UButton @click="saveAvatar" size="sm" :loading="uploading" class="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Avatar
                </UButton>
                <UButton @click="cancelAvatar" size="sm" variant="ghost">
                  Cancel
                </UButton>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <UInput v-model="profileForm.full_name" type="text" placeholder="Full Name" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <UInput v-model="profileForm.email" type="email" placeholder="Email" disabled class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
              <UInput v-model="profileForm.phone" type="tel" placeholder="Mobile Phone Number" class="w-full" />
            </div>
            <div class="pt-2">
              <UButton @click="saveProfile" :loading="saving" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg">
                Save Changes
              </UButton>
            </div>
          </div>

          <!-- Footer actions -->
          <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Signed in as</p>
              <p class="font-medium text-gray-900">{{ profile?.full_name || user?.email }}</p>
              <p class="text-sm text-gray-600">{{ user?.email }}</p>
            </div>
            <div class="flex gap-2">
              <UButton variant="outline" @click="navigateTo('/dashboard')">Dashboard</UButton>
              <UButton color="red" variant="soft" @click="onLogout">Logout</UButton>
            </div>
          </div>
        </div>
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
const saving = ref(false)

// Profile form data
const profileForm = ref({
  full_name: '',
  email: '',
  phone: ''
})

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
    if (profile.value) {
      profileForm.value = {
        full_name: profile.value.full_name || '',
        email: profile.value.email || '',
        phone: profile.value.phone || ''
      }
    }
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
        .select('id, full_name, email, phone, avatar_url, created_at, updated_at')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error)
        console.error('Error details:', error.message, error.code)
        profile.value = null
      } else if (data) {
        profile.value = data
        profileForm.value = {
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || ''
        }
      } else {
        // No profile found, create one
        console.log('No profile found, creating one...')
        try {
          const { data: newProfile, error: createError } = await client
            .from('safehouse_profiles')
            .insert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || '',
              email: session.user.email || '',
              phone: null
            })
            .select('id, full_name, email, phone, avatar_url, created_at, updated_at')
            .single()

          if (createError) {
            console.error('Profile creation error:', createError)
            profile.value = null
          } else {
            profile.value = newProfile
            profileForm.value = {
              full_name: newProfile.full_name || '',
              email: newProfile.email || '',
              phone: newProfile.phone || ''
            }
          }
        } catch (createErr) {
          console.error('Profile creation error:', createErr)
          profile.value = null
        }
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

async function saveProfile() {
  if (!profile.value) return
  
  saving.value = true
  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    
    if (!session) {
      alert('No valid session found')
      return
    }
    
    const { error } = await client
      .from('safehouse_profiles')
      .update({
        full_name: profileForm.value.full_name,
        phone: profileForm.value.phone
      })
      .eq('id', session.user.id)

    if (error) {
      console.error('Profile update error:', error)
      console.error('Error details:', error.message, error.code)
      alert('Failed to update profile: ' + (error.message || 'Unknown error'))
    } else {
      // Refresh profile data
      profile.value = await auth.getProfile()
      alert('Profile updated successfully!')
    }
  } catch (error) {
    console.error('Profile update error:', error)
    alert('Failed to update profile: ' + (error.message || 'Unknown error'))
  } finally {
    saving.value = false
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
