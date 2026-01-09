import { defineStore } from 'pinia'

export interface CreditsInfo {
  success: boolean
  availableCredits: number
  usedCredits: number
  maxProperties: number
  hasActiveSubscription: boolean
  canAddMore: boolean
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'past_due'
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const auth = useAuthStore()
  const client = useSupabaseClient()
  
  // State
  const creditsInfo = ref<CreditsInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)
  
  // Cache duration: 1 minute (credits change frequently)
  const CACHE_DURATION = 60 * 1000

  // Computed
  const canAddProperty = computed(() => {
    if (!creditsInfo.value) return false
    return creditsInfo.value.availableCredits > 0 && creditsInfo.value.subscriptionStatus === 'active'
  })

  const hasActiveSubscription = computed(() => {
    return creditsInfo.value?.subscriptionStatus === 'active' || false
  })

  const availableCredits = computed(() => creditsInfo.value?.availableCredits || 0)
  const usedCredits = computed(() => creditsInfo.value?.usedCredits || 0)

  // Actions
  async function fetchCredits(force = false) {
    if (!auth.user.value) {
      creditsInfo.value = null
      return null
    }

    // Check cache if not forcing refresh
    if (!force && creditsInfo.value && lastFetched.value) {
      const cacheAge = Date.now() - lastFetched.value
      if (cacheAge < CACHE_DURATION) {
        return creditsInfo.value
      }
    }

    loading.value = true
    error.value = null

    try {
      const { data: { session } } = await client.auth.getSession()
      
      if (!session) {
        creditsInfo.value = null
        return null
      }

      const response = await $fetch('/api/subscription/get-credits', {
        headers: {
          authorization: `Bearer ${session.access_token}`
        }
      })

      if (response.success) {
        creditsInfo.value = response
        lastFetched.value = Date.now()
        return creditsInfo.value
      }

      throw new Error('Failed to fetch credits')
    } catch (err: any) {
      console.error('Failed to load credits:', err)
      error.value = err.message || 'Failed to load credits'
      creditsInfo.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  // Optimistically decrement credits (call after creating property)
  function decrementCredits() {
    if (creditsInfo.value) {
      creditsInfo.value.availableCredits = Math.max(0, creditsInfo.value.availableCredits - 1)
      creditsInfo.value.usedCredits = (creditsInfo.value.usedCredits || 0) + 1
    }
  }

  // Optimistically increment credits (call after deleting property)
  function incrementCredits() {
    if (creditsInfo.value) {
      creditsInfo.value.availableCredits = (creditsInfo.value.availableCredits || 0) + 1
      creditsInfo.value.usedCredits = Math.max(0, (creditsInfo.value.usedCredits || 0) - 1)
    }
  }

  function clearCredits() {
    creditsInfo.value = null
    lastFetched.value = null
    error.value = null
  }

  // Watch for auth changes
  watch(() => auth.user.value, (newUser) => {
    if (newUser) {
      fetchCredits()
    } else {
      clearCredits()
    }
  }, { immediate: true })

  return {
    // State
    creditsInfo: readonly(creditsInfo),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    canAddProperty,
    hasActiveSubscription,
    availableCredits,
    usedCredits,
    
    // Actions
    fetchCredits,
    decrementCredits,
    incrementCredits,
    clearCredits
  }
})

