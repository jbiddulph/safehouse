import { defineStore } from 'pinia'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  role?: string
  created_at?: string
  updated_at?: string
}

export const useProfileStore = defineStore('profile', () => {
  const auth = useAuthStore()
  const client = useSupabaseClient()
  
  // State
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)
  
  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  // Computed
  const isLoaded = computed(() => profile.value !== null)
  const hasPhone = computed(() => !!profile.value?.phone?.trim())
  const avatarUrl = computed(() => {
    if (!profile.value?.avatar_url) return null
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime()
    return profile.value.avatar_url.includes('?t=')
      ? profile.value.avatar_url
      : `${profile.value.avatar_url}?t=${timestamp}`
  })

  // Actions
  async function fetchProfile(force = false) {
    // Check cache if not forcing refresh
    if (!force && profile.value && lastFetched.value) {
      const cacheAge = Date.now() - lastFetched.value
      if (cacheAge < CACHE_DURATION) {
        return profile.value
      }
    }

    if (!auth.user.value) {
      profile.value = null
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await client
        .from('safehouse_profiles')
        .select('*')
        .eq('id', auth.user.value.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      profile.value = data
      lastFetched.value = Date.now()
      return data
    } catch (err: any) {
      console.error('Profile fetch error:', err)
      error.value = err.message || 'Failed to load profile'
      profile.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!auth.user.value || !profile.value) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await client
        .from('safehouse_profiles')
        .update(updates)
        .eq('id', auth.user.value.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Update local state optimistically
      profile.value = { ...profile.value, ...data }
      lastFetched.value = Date.now()
      return data
    } catch (err: any) {
      console.error('Profile update error:', err)
      error.value = err.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAvatar(avatarUrl: string) {
    return updateProfile({ avatar_url: avatarUrl })
  }

  function clearProfile() {
    profile.value = null
    lastFetched.value = null
    error.value = null
  }

  // Watch for auth changes
  watch(() => auth.user.value, (newUser) => {
    if (newUser) {
      fetchProfile()
    } else {
      clearProfile()
    }
  }, { immediate: true })

  return {
    // State
    profile: readonly(profile),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    isLoaded,
    hasPhone,
    avatarUrl,
    
    // Actions
    fetchProfile,
    updateProfile,
    updateAvatar,
    clearProfile
  }
})

