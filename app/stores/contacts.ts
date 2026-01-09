import { defineStore } from 'pinia'

export interface Contact {
  id: string
  user_id: string
  contact_name: string
  email: string
  phone: string | null
  relationship: string | null
  is_primary: boolean
  is_tenant: boolean
  emergency_access_level: string
  created_at?: string
  updated_at?: string
}

export const useContactsStore = defineStore('contacts', () => {
  const auth = useAuthStore()
  
  // State
  const contacts = ref<Contact[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)
  
  // Cache duration: 2 minutes
  const CACHE_DURATION = 2 * 60 * 1000

  // Computed
  const contactCount = computed(() => contacts.value.length)
  const primaryContacts = computed(() => contacts.value.filter(c => c.is_primary))
  const emergencyContacts = computed(() => contacts.value.filter(c => c.emergency_access_level === 'emergency'))

  // Actions
  async function fetchContacts(force = false) {
    if (!auth.user.value) {
      contacts.value = []
      return []
    }

    // Check cache if not forcing refresh
    if (!force && contacts.value.length > 0 && lastFetched.value) {
      const cacheAge = Date.now() - lastFetched.value
      if (cacheAge < CACHE_DURATION) {
        return contacts.value
      }
    }

    loading.value = true
    error.value = null

    try {
      const { contacts: data } = await $fetch('/api/contacts', {
        query: { userId: auth.user.value.id }
      })

      contacts.value = data || []
      lastFetched.value = Date.now()
      return contacts.value
    } catch (err: any) {
      console.error('Failed to load contacts:', err)
      error.value = err.message || 'Failed to load contacts'
      contacts.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function createContact(contactData: Partial<Contact>) {
    if (!auth.user.value) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const { success, contact } = await $fetch('/api/contacts', {
        method: 'POST',
        body: {
          ...contactData,
          user_id: auth.user.value.id
        }
      })

      if (success && contact) {
        // Optimistically add to list
        contacts.value.push(contact)
        lastFetched.value = Date.now()
        return contact
      }

      throw new Error('Failed to create contact')
    } catch (err: any) {
      console.error('Failed to create contact:', err)
      error.value = err.message || 'Failed to create contact'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateContact(contactId: string, updates: Partial<Contact>) {
    loading.value = true
    error.value = null

    try {
      const { success, contact } = await $fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        body: updates
      })

      if (success && contact) {
        // Optimistically update in list
        const index = contacts.value.findIndex(c => c.id === contactId)
        if (index !== -1) {
          contacts.value[index] = contact
        }
        lastFetched.value = Date.now()
        return contact
      }

      throw new Error('Failed to update contact')
    } catch (err: any) {
      console.error('Failed to update contact:', err)
      error.value = err.message || 'Failed to update contact'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteContact(contactId: string) {
    loading.value = true
    error.value = null

    try {
      const { success } = await $fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      })

      if (success) {
        // Optimistically remove from list
        contacts.value = contacts.value.filter(c => c.id !== contactId)
        lastFetched.value = Date.now()
        return true
      }

      throw new Error('Failed to delete contact')
    } catch (err: any) {
      console.error('Failed to delete contact:', err)
      error.value = err.message || 'Failed to delete contact'
      throw err
    } finally {
      loading.value = false
    }
  }

  function getContactById(contactId: string) {
    return contacts.value.find(c => c.id === contactId) || null
  }

  function clearContacts() {
    contacts.value = []
    lastFetched.value = null
    error.value = null
  }

  // Watch for auth changes
  watch(() => auth.user.value, (newUser) => {
    if (newUser) {
      fetchContacts()
    } else {
      clearContacts()
    }
  }, { immediate: true })

  return {
    // State
    contacts: readonly(contacts),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    contactCount,
    primaryContacts,
    emergencyContacts,
    
    // Actions
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    getContactById,
    clearContacts
  }
})

