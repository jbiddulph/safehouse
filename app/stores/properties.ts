import { defineStore } from 'pinia'

export interface Property {
  id: string
  user_id: string
  property_name: string
  address: string
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  property_type: string
  latitude: number | null
  longitude: number | null
  emergency_access_enabled: boolean
  keysafe_location?: string | null
  keysafe_code?: string | null
  keysafe_notes?: string | null
  keysafe_what3words?: string | null
  keysafe_latitude?: number | null
  keysafe_longitude?: number | null
  created_at?: string
  updated_at?: string
  safehouse_property_contacts?: Array<{ count: number }>
}

export const usePropertiesStore = defineStore('properties', () => {
  const auth = useAuthStore()
  
  // State
  const properties = ref<Property[]>([])
  const selectedPropertyId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)
  
  // Cache duration: 2 minutes
  const CACHE_DURATION = 2 * 60 * 1000

  // Computed
  const currentProperty = computed(() => {
    if (selectedPropertyId.value) {
      return properties.value.find(p => p.id === selectedPropertyId.value) || null
    }
    // Auto-select first property if only one exists
    if (properties.value.length === 1) {
      return properties.value[0]
    }
    return null
  })

  const propertyCount = computed(() => properties.value.length)
  const hasProperties = computed(() => properties.value.length > 0)

  // Actions
  async function fetchProperties(force = false) {
    if (!auth.user.value) {
      properties.value = []
      return []
    }

    // Check cache if not forcing refresh
    if (!force && properties.value.length > 0 && lastFetched.value) {
      const cacheAge = Date.now() - lastFetched.value
      if (cacheAge < CACHE_DURATION) {
        return properties.value
      }
    }

    loading.value = true
    error.value = null

    try {
      const { properties: data } = await $fetch('/api/properties', {
        query: { userId: auth.user.value.id }
      })

      properties.value = data || []
      lastFetched.value = Date.now()
      return properties.value
    } catch (err: any) {
      console.error('Failed to load properties:', err)
      error.value = err.message || 'Failed to load properties'
      properties.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function createProperty(propertyData: Partial<Property>) {
    if (!auth.user.value) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const { success, property } = await $fetch('/api/properties', {
        method: 'POST',
        body: {
          ...propertyData,
          user_id: auth.user.value.id
        }
      })

      if (success && property) {
        // Optimistically add to list
        properties.value.unshift(property)
        selectedPropertyId.value = property.id
        lastFetched.value = Date.now()
        return property
      }

      throw new Error('Failed to create property')
    } catch (err: any) {
      console.error('Failed to create property:', err)
      error.value = err.message || 'Failed to create property'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProperty(propertyId: string, updates: Partial<Property>) {
    loading.value = true
    error.value = null

    try {
      const { success, property } = await $fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        body: updates
      })

      if (success && property) {
        // Optimistically update in list
        const index = properties.value.findIndex(p => p.id === propertyId)
        if (index !== -1) {
          properties.value[index] = property
        }
        lastFetched.value = Date.now()
        return property
      }

      throw new Error('Failed to update property')
    } catch (err: any) {
      console.error('Failed to update property:', err)
      error.value = err.message || 'Failed to update property'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProperty(propertyId: string) {
    loading.value = true
    error.value = null

    try {
      const { success } = await $fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      })

      if (success) {
        // Optimistically remove from list
        properties.value = properties.value.filter(p => p.id !== propertyId)
        
        // Clear selection if deleted property was selected
        if (selectedPropertyId.value === propertyId) {
          selectedPropertyId.value = properties.value.length > 0 ? properties.value[0].id : null
        }
        
        lastFetched.value = Date.now()
        return true
      }

      throw new Error('Failed to delete property')
    } catch (err: any) {
      console.error('Failed to delete property:', err)
      error.value = err.message || 'Failed to delete property'
      throw err
    } finally {
      loading.value = false
    }
  }

  function selectProperty(propertyId: string | null) {
    selectedPropertyId.value = propertyId
  }

  function getPropertyById(propertyId: string) {
    return properties.value.find(p => p.id === propertyId) || null
  }

  function clearProperties() {
    properties.value = []
    selectedPropertyId.value = null
    lastFetched.value = null
    error.value = null
  }

  // Watch for auth changes
  watch(() => auth.user.value, (newUser) => {
    if (newUser) {
      fetchProperties()
    } else {
      clearProperties()
    }
  }, { immediate: true })

  return {
    // State
    properties: readonly(properties),
    selectedPropertyId,
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    currentProperty,
    propertyCount,
    hasProperties,
    
    // Actions
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    selectProperty,
    getPropertyById,
    clearProperties
  }
})

