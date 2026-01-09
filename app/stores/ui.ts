import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', () => {
  // Modal states
  const showAddProperty = ref(false)
  const showEditProperty = ref(false)
  const showAddContact = ref(false)
  const showEditContact = ref(false)
  const showPhoneRequiredModal = ref(false)
  const showProfileMenu = ref(false)
  const showMobileMenu = ref(false)

  // Loading states
  const globalLoading = ref(false)
  const loadingMessage = ref<string | null>(null)

  // Notification/Toast states
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>>([])

  // Actions for modals
  function openModal(modalName: string) {
    switch (modalName) {
      case 'addProperty':
        showAddProperty.value = true
        break
      case 'editProperty':
        showEditProperty.value = true
        break
      case 'addContact':
        showAddContact.value = true
        break
      case 'editContact':
        showEditContact.value = true
        break
      case 'phoneRequired':
        showPhoneRequiredModal.value = true
        break
    }
  }

  function closeModal(modalName: string) {
    switch (modalName) {
      case 'addProperty':
        showAddProperty.value = false
        break
      case 'editProperty':
        showEditProperty.value = false
        break
      case 'addContact':
        showAddContact.value = false
        break
      case 'editContact':
        showEditContact.value = false
        break
      case 'phoneRequired':
        showPhoneRequiredModal.value = false
        break
    }
  }

  function closeAllModals() {
    showAddProperty.value = false
    showEditProperty.value = false
    showAddContact.value = false
    showEditContact.value = false
    showPhoneRequiredModal.value = false
    showProfileMenu.value = false
    showMobileMenu.value = false
  }

  // Actions for loading
  function setLoading(loading: boolean, message?: string) {
    globalLoading.value = loading
    loadingMessage.value = message || null
  }

  // Actions for notifications
  function showNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    duration = 5000
  ) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    notifications.value.push({ id, type, message, duration })
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clearNotifications() {
    notifications.value = []
  }

  // Convenience methods
  const notify = {
    success: (message: string, duration?: number) => showNotification('success', message, duration),
    error: (message: string, duration?: number) => showNotification('error', message, duration),
    warning: (message: string, duration?: number) => showNotification('warning', message, duration),
    info: (message: string, duration?: number) => showNotification('info', message, duration)
  }

  return {
    // Modal states
    showAddProperty,
    showEditProperty,
    showAddContact,
    showEditContact,
    showPhoneRequiredModal,
    showProfileMenu,
    showMobileMenu,
    
    // Loading states
    globalLoading: readonly(globalLoading),
    loadingMessage: readonly(loadingMessage),
    
    // Notifications
    notifications: readonly(notifications),
    
    // Actions
    openModal,
    closeModal,
    closeAllModals,
    setLoading,
    showNotification,
    removeNotification,
    clearNotifications,
    notify
  }
})

