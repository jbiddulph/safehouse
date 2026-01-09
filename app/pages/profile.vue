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

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/dashboard" 
              class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink 
              to="/profile" 
              class="text-sm font-medium text-white border-b-2 border-[#8ee0ee] pb-1"
            >
              Profile
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-2xl mx-auto space-y-8">
        <!-- Header Text -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-[#03045e] mb-2">Your Profile</h1>
          <p class="text-lg text-gray-600">
            Manage your account details and avatar
          </p>
        </div>

        <!-- Card -->
        <div class="bg-white shadow-xl rounded-lg p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03045e] mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading profile...</p>
        </div>

        <!-- Profile Content -->
        <div v-else class="space-y-8">
          <!-- Top: Avatar + Basic Info -->
          <div class="flex items-center gap-5">
            <div class="relative">
              <div v-if="avatarUrl" class="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary-200">
                <img :src="avatarUrl" alt="Profile picture" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-primary-200">
                <Icon name="mdi:account" class="w-10 h-10 text-gray-400" />
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
          <div v-if="avatarPreview" class="bg-[#f0f9fb] border border-[#8ee0ee] rounded-lg p-4">
            <p class="text-sm font-medium text-[#03045e]">Preview</p>
            <div class="mt-2 flex items-center gap-3">
              <div class="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary-200">
                <img :src="avatarPreview" alt="Avatar preview" class="w-full h-full object-cover" />
              </div>
              <div class="flex gap-2">
                <UButton @click="saveAvatar" size="sm" :loading="uploading" class="bg-[#03045e] hover:bg-[#03045e] text-white">
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
              <UInput v-model="profileForm.full_name" type="text" placeholder="Full Name" class="w-full h-10" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <UInput v-model="profileForm.email" type="email" placeholder="Email" disabled class="w-full h-10" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
              <div class="flex gap-2">
                <div class="w-32">
                  <select
                    id="countryCode"
                    v-model="selectedCountryCode"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee] h-10"
                    @change="onCountryCodeChange"
                  >
                    <option v-for="country in countryCodes" :key="country.code" :value="country.code">
                      {{ country.flag }} {{ country.code }}
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <UInput 
                    v-model="phoneNumber" 
                    type="tel" 
                    :placeholder="phonePlaceholder" 
                    class="w-full h-10"
                    @input="formatPhoneNumber"
                  />
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ phoneFormatHint }}
              </p>
              <p v-if="phoneError" class="mt-1 text-xs text-red-600">{{ phoneError }}</p>
            </div>
            <div class="pt-2 flex justify-end">
              <UButton @click="saveProfile" :loading="saving" class="bg-[#03045e] hover:bg-[#03045e] text-white font-semibold py-2 px-4 rounded-lg text-sm">
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

// Use country codes store
const countryCodesStore = useCountryCodesStore()
const countryCodes = countryCodesStore.countryCodes

const selectedCountryCode = ref('+44')
const phoneNumber = ref('')
const currentCountry = computed(() => countryCodesStore.getCountryByCode(selectedCountryCode.value) || countryCodes[0])
const phonePlaceholder = computed(() => {
  const country = currentCountry.value
  return country ? `${selectedCountryCode.value}${country.example}` : '+447987654321'
})
const phoneFormatHint = computed(() => {
  const country = currentCountry.value
  return country ? `Format: ${country.code} followed by your number (e.g., ${country.code}${country.example})` : 'Format: +44 followed by your number (e.g., +447987654321)'
})

// Phone validation
const phoneError = ref('')

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
      // Parse existing phone number to extract country code
      parseExistingPhone(profile.value.phone || '')
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
        // Parse existing phone number to extract country code
        parseExistingPhone(data.phone || '')
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
            // Parse existing phone number to extract country code
            parseExistingPhone(newProfile.phone || '')
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

// Parse existing phone number if it has a country code
function parseExistingPhone(phoneValue: string) {
  if (!phoneValue) {
    selectedCountryCode.value = '+44'
    phoneNumber.value = ''
    return
  }
  
  const parsed = countryCodesStore.parsePhoneNumber(phoneValue)
  if (parsed) {
    selectedCountryCode.value = parsed.countryCode
    phoneNumber.value = parsed.number
    profileForm.value.phone = phoneValue
  } else {
    // If no match found, default to UK and use the whole value
    selectedCountryCode.value = '+44'
    phoneNumber.value = phoneValue
    profileForm.value.phone = phoneValue
  }
}

// Handle country code change
function onCountryCodeChange() {
  phoneError.value = ''
  // Rebuild the full phone number
  const fullPhone = selectedCountryCode.value + phoneNumber.value
  profileForm.value.phone = fullPhone
}

// Format phone number as user types
function formatPhoneNumber(event: Event) {
  phoneError.value = ''
  const input = event.target as HTMLInputElement
  let value = input.value.trim()
  
  // Remove all non-digit characters
  value = value.replace(/\D/g, '')
  
  // Remove leading 0 if present (common in UK numbers)
  if (value.startsWith('0')) {
    value = value.substring(1)
  }
  
  phoneNumber.value = value
  
  // Combine country code + number for validation
  const fullPhone = selectedCountryCode.value + value
  const country = currentCountry.value
  
  // Validate format based on country pattern
  if (value && value.length > 0 && country) {
    if (!country.pattern.test(fullPhone)) {
      phoneError.value = `Phone number must be in format ${country.code} followed by your number (e.g., ${country.code}${country.example})`
    } else {
      phoneError.value = ''
    }
  }
  
  // Update the full phone value
  profileForm.value.phone = fullPhone
}

async function saveProfile() {
  if (!profile.value) return
  
  // Combine country code + phone number
  const fullPhone = selectedCountryCode.value + phoneNumber.value.trim()
  profileForm.value.phone = fullPhone
  
  // Validate phone number format
  if (phoneNumber.value && phoneNumber.value.trim()) {
    const country = currentCountry.value
    if (!country || !country.pattern.test(fullPhone)) {
      phoneError.value = country ? `Phone number must be in format ${country.code} followed by your number (e.g., ${country.code}${country.example})` : 'Invalid phone number format'
      return
    }
  }
  
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
        phone: profileForm.value.phone.trim() || null
      })
      .eq('id', session.user.id)

    if (error) {
      console.error('Profile update error:', error)
      console.error('Error details:', error.message, error.code)
      alert('Failed to update profile: ' + (error.message || 'Unknown error'))
    } else {
      // Refresh profile data
      profile.value = await auth.getProfile()
      phoneError.value = ''
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
