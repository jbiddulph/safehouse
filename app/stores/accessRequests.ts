import { defineStore } from 'pinia'

export interface AccessRequest {
  id: string
  property_id: string
  requester_email: string
  requester_name?: string | null
  requester_phone?: string | null
  access_type: 'emergency' | 'standard'
  status: 'pending' | 'verified' | 'approved' | 'denied'
  created_at?: string
  updated_at?: string
  property?: {
    property_name: string
    address: string
  }
}

export const useAccessRequestsStore = defineStore('accessRequests', () => {
  // State
  const pendingRequests = ref<AccessRequest[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)
  
  // Cache duration: 30 seconds (access requests are time-sensitive)
  const CACHE_DURATION = 30 * 1000

  // Computed
  const pendingCount = computed(() => pendingRequests.value.length)
  const hasPendingRequests = computed(() => pendingRequests.value.length > 0)
  const emergencyRequests = computed(() => 
    pendingRequests.value.filter(r => r.access_type === 'emergency')
  )
  const standardRequests = computed(() => 
    pendingRequests.value.filter(r => r.access_type === 'standard')
  )

  // Actions
  async function fetchPendingRequests(force = false) {
    // Check cache if not forcing refresh
    if (!force && pendingRequests.value.length > 0 && lastFetched.value) {
      const cacheAge = Date.now() - lastFetched.value
      if (cacheAge < CACHE_DURATION) {
        return pendingRequests.value
      }
    }

    loading.value = true
    error.value = null

    try {
      const result = await $fetch('/api/access-requests/pending')
      
      if (result.success) {
        pendingRequests.value = result.pending || []
        lastFetched.value = Date.now()
        return pendingRequests.value
      }

      throw new Error('Failed to fetch pending requests')
    } catch (err: any) {
      console.error('Failed to load pending access requests:', err)
      error.value = err.message || 'Failed to load pending requests'
      pendingRequests.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  // Optimistically remove request after approval/denial
  function removeRequest(requestId: string) {
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== requestId)
  }

  // Optimistically add request (for real-time updates)
  function addRequest(request: AccessRequest) {
    // Check if already exists
    if (!pendingRequests.value.find(r => r.id === request.id)) {
      pendingRequests.value.unshift(request)
    }
  }

  function clearRequests() {
    pendingRequests.value = []
    lastFetched.value = null
    error.value = null
  }

  return {
    // State
    pendingRequests: readonly(pendingRequests),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    pendingCount,
    hasPendingRequests,
    emergencyRequests,
    standardRequests,
    
    // Actions
    fetchPendingRequests,
    removeRequest,
    addRequest,
    clearRequests
  }
})

