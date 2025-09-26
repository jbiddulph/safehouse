<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <NuxtLink 
            to="/dashboard" 
            class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </NuxtLink>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Domain Management</h1>
            <p class="text-gray-600">Manage allowed and blocked domains for your SafeHouse system</p>
          </div>
          <div v-if="isAdmin" class="flex items-center gap-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Admin Access
            </span>
          </div>
        </div>
      </div>
      
      <!-- Allowed Domains Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Allowed Domains</h2>
        
        <!-- Add Allowed Domain Form -->
        <form @submit.prevent="addAllowedDomain" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input 
                v-model="newAllowedDomain.domain" 
                type="text" 
                placeholder="example.com" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input 
                v-model="newAllowedDomain.description" 
                type="text" 
                placeholder="Trusted partner domain" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
              <input 
                v-model="newAllowedDomain.expires_at" 
                type="datetime-local" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button 
            type="submit" 
            :disabled="addingAllowed"
            class="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {{ addingAllowed ? 'Adding...' : 'Add Allowed Domain' }}
          </button>
        </form>

        <!-- Allowed Domains List -->
        <div v-if="allowedDomains.length > 0" class="space-y-2">
          <div 
            v-for="domain in allowedDomains" 
            :key="domain.id"
            class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-green-900">{{ domain.domain }}</span>
                <span v-if="!domain.is_active" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Inactive</span>
              </div>
              <span v-if="domain.description" class="text-sm text-green-700 block">{{ domain.description }}</span>
              <div class="text-xs text-green-600">
                Added {{ formatDate(domain.created_at) }}
                <span v-if="domain.expires_at"> • Expires {{ formatDate(domain.expires_at) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Allowed</span>
              <div class="flex gap-1">
                <button 
                  @click="editAllowedDomain(domain)"
                  class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button 
                  @click="deleteAllowedDomain(domain.id)"
                  class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 text-center py-4">
          No allowed domains found
        </div>
      </div>

      <!-- Blocked Domains Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Blocked Domains</h2>
        
        <!-- Add Blocked Domain Form -->
        <form @submit.prevent="addBlockedDomain" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input 
                v-model="newBlockedDomain.domain" 
                type="text" 
                placeholder="malicious.com" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input 
                v-model="newBlockedDomain.reason" 
                type="text" 
                placeholder="Known malware distribution" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
              <input 
                v-model="newBlockedDomain.expires_at" 
                type="datetime-local" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button 
            type="submit" 
            :disabled="addingBlocked"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ addingBlocked ? 'Adding...' : 'Add Blocked Domain' }}
          </button>
        </form>

        <!-- Blocked Domains List -->
        <div v-if="blockedDomains.length > 0" class="space-y-2">
          <div 
            v-for="domain in blockedDomains" 
            :key="domain.id"
            class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-red-900">{{ domain.domain }}</span>
                <span v-if="!domain.is_active" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Inactive</span>
              </div>
              <span v-if="domain.reason" class="text-sm text-red-700 block">{{ domain.reason }}</span>
              <div class="text-xs text-red-600">
                Blocked {{ formatDate(domain.created_at) }}
                <span v-if="domain.expires_at"> • Expires {{ formatDate(domain.expires_at) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Blocked</span>
              <div class="flex gap-1">
                <button 
                  @click="editBlockedDomain(domain)"
                  class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button 
                  @click="deleteBlockedDomain(domain.id)"
                  class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 text-center py-4">
          No blocked domains found
        </div>
      </div>

      <!-- Test Results -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
        <div class="space-y-2">
          <div class="text-sm text-gray-600">
            <strong>Allowed Domains:</strong> {{ allowedDomains.length }}
          </div>
          <div class="text-sm text-gray-600">
            <strong>Blocked Domains:</strong> {{ blockedDomains.length }}
          </div>
          <div class="text-sm text-gray-600">
            <strong>Database Status:</strong> 
            <span :class="dbStatus === 'connected' ? 'text-green-600' : 'text-red-600'">
              {{ dbStatus }}
            </span>
          </div>
        </div>
      </div>

      <!-- Edit Allowed Domain Modal -->
      <div v-if="editingAllowed" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Edit Allowed Domain</h3>
          <form @submit.prevent="updateAllowedDomain" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input 
                v-model="editingAllowedData.domain" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input 
                v-model="editingAllowedData.description" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input 
                v-model="editingAllowedData.expires_at" 
                type="datetime-local" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="flex items-center">
              <input 
                v-model="editingAllowedData.is_active" 
                type="checkbox" 
                id="allowed-active"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="allowed-active" class="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
            <div class="flex justify-end space-x-3">
              <button 
                @click="cancelEditAllowed" 
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="updatingAllowed"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ updatingAllowed ? 'Updating...' : 'Update Domain' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Blocked Domain Modal -->
      <div v-if="editingBlocked" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Edit Blocked Domain</h3>
          <form @submit.prevent="updateBlockedDomain" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input 
                v-model="editingBlockedData.domain" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input 
                v-model="editingBlockedData.reason" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input 
                v-model="editingBlockedData.expires_at" 
                type="datetime-local" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="flex items-center">
              <input 
                v-model="editingBlockedData.is_active" 
                type="checkbox" 
                id="blocked-active"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="blocked-active" class="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
            <div class="flex justify-end space-x-3">
              <button 
                @click="cancelEditBlocked" 
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="updatingBlocked"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ updatingBlocked ? 'Updating...' : 'Update Domain' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

// Reactive data
const allowedDomains = ref([])
const blockedDomains = ref([])
const addingAllowed = ref(false)
const addingBlocked = ref(false)
const updatingAllowed = ref(false)
const updatingBlocked = ref(false)
const editingAllowed = ref(false)
const editingBlocked = ref(false)
const dbStatus = ref('checking')
const profile = ref(null)
const isAdmin = ref(false)

// Form data
const newAllowedDomain = ref({
  domain: '',
  description: '',
  expires_at: ''
})

const newBlockedDomain = ref({
  domain: '',
  reason: '',
  expires_at: ''
})

// Edit data
const editingAllowedData = ref({
  id: '',
  domain: '',
  description: '',
  expires_at: '',
  is_active: true
})

const editingBlockedData = ref({
  id: '',
  domain: '',
  reason: '',
  expires_at: '',
  is_active: true
})

// Load domains on mount
onMounted(async () => {
  await loadProfile()
  await loadDomains()
})

// Load user profile and check role
async function loadProfile() {
  try {
    const auth = useAuthStore()
    profile.value = await auth.getProfile()
    isAdmin.value = profile.value?.role === 'admin'
    
    if (!isAdmin.value) {
      // Redirect non-admin users
      await navigateTo('/dashboard')
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    await navigateTo('/dashboard')
  }
}

// Load all domains
async function loadDomains() {
  try {
    dbStatus.value = 'loading'
    
    const [allowedResponse, blockedResponse] = await Promise.all([
      $fetch('/api/domains/allowed'),
      $fetch('/api/domains/blocked')
    ])
    
    if (allowedResponse.success) {
      allowedDomains.value = allowedResponse.domains
    } else {
      console.error('Failed to load allowed domains:', allowedResponse.message)
    }
    
    if (blockedResponse.success) {
      blockedDomains.value = blockedResponse.domains
    } else {
      console.error('Failed to load blocked domains:', blockedResponse.message)
    }
    
    dbStatus.value = 'connected'
  } catch (error) {
    console.error('Error loading domains:', error)
    dbStatus.value = 'error'
  }
}

// Add allowed domain
async function addAllowedDomain() {
  if (!newAllowedDomain.value.domain) return
  
  addingAllowed.value = true
  try {
    // Get current user ID from profile
    if (!profile.value?.id) {
      alert('Please log in to add domains')
      return
    }

    const response = await $fetch('/api/domains/allowed', {
      method: 'POST',
      body: {
        ...newAllowedDomain.value,
        user_id: profile.value.id
      }
    })
    
    if (response.success) {
      await loadDomains()
      newAllowedDomain.value = { domain: '', description: '', expires_at: '' }
      alert('Allowed domain added successfully!')
    } else {
      alert('Failed to add allowed domain: ' + (response.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error adding allowed domain:', error)
    alert('Failed to add allowed domain')
  } finally {
    addingAllowed.value = false
  }
}

// Add blocked domain
async function addBlockedDomain() {
  if (!newBlockedDomain.value.domain) return
  
  addingBlocked.value = true
  try {
    // Get current user ID from profile
    if (!profile.value?.id) {
      alert('Please log in to add domains')
      return
    }

    const response = await $fetch('/api/domains/blocked', {
      method: 'POST',
      body: {
        ...newBlockedDomain.value,
        user_id: profile.value.id
      }
    })
    
    if (response.success) {
      await loadDomains()
      newBlockedDomain.value = { domain: '', reason: '', expires_at: '' }
      alert('Blocked domain added successfully!')
    } else {
      alert('Failed to add blocked domain')
    }
  } catch (error) {
    console.error('Error adding blocked domain:', error)
    alert('Failed to add blocked domain')
  } finally {
    addingBlocked.value = false
  }
}

// Edit allowed domain
function editAllowedDomain(domain: any) {
  editingAllowedData.value = {
    id: domain.id,
    domain: domain.domain,
    description: domain.description || '',
    expires_at: domain.expires_at ? new Date(domain.expires_at).toISOString().slice(0, 16) : '',
    is_active: domain.is_active
  }
  editingAllowed.value = true
}

// Edit blocked domain
function editBlockedDomain(domain: any) {
  editingBlockedData.value = {
    id: domain.id,
    domain: domain.domain,
    reason: domain.reason || '',
    expires_at: domain.expires_at ? new Date(domain.expires_at).toISOString().slice(0, 16) : '',
    is_active: domain.is_active
  }
  editingBlocked.value = true
}

// Cancel edit allowed
function cancelEditAllowed() {
  editingAllowed.value = false
  editingAllowedData.value = {
    id: '',
    domain: '',
    description: '',
    expires_at: '',
    is_active: true
  }
}

// Cancel edit blocked
function cancelEditBlocked() {
  editingBlocked.value = false
  editingBlockedData.value = {
    id: '',
    domain: '',
    reason: '',
    expires_at: '',
    is_active: true
  }
}

// Update allowed domain
async function updateAllowedDomain() {
  updatingAllowed.value = true
  try {
    const response = await $fetch(`/api/domains/allowed/${editingAllowedData.value.id}`, {
      method: 'PUT',
      body: editingAllowedData.value
    })
    
    if (response.success) {
      await loadDomains()
      cancelEditAllowed()
      alert('Allowed domain updated successfully!')
    } else {
      alert('Failed to update allowed domain')
    }
  } catch (error) {
    console.error('Error updating allowed domain:', error)
    alert('Failed to update allowed domain')
  } finally {
    updatingAllowed.value = false
  }
}

// Update blocked domain
async function updateBlockedDomain() {
  updatingBlocked.value = true
  try {
    const response = await $fetch(`/api/domains/blocked/${editingBlockedData.value.id}`, {
      method: 'PUT',
      body: editingBlockedData.value
    })
    
    if (response.success) {
      await loadDomains()
      cancelEditBlocked()
      alert('Blocked domain updated successfully!')
    } else {
      alert('Failed to update blocked domain')
    }
  } catch (error) {
    console.error('Error updating blocked domain:', error)
    alert('Failed to update blocked domain')
  } finally {
    updatingBlocked.value = false
  }
}

// Delete allowed domain
async function deleteAllowedDomain(id: string) {
  if (!confirm('Are you sure you want to delete this allowed domain?')) {
    return
  }
  
  try {
    const response = await $fetch(`/api/domains/allowed/${id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      await loadDomains()
      alert('Allowed domain deleted successfully!')
    } else {
      alert('Failed to delete allowed domain')
    }
  } catch (error) {
    console.error('Error deleting allowed domain:', error)
    alert('Failed to delete allowed domain')
  }
}

// Delete blocked domain
async function deleteBlockedDomain(id: string) {
  if (!confirm('Are you sure you want to delete this blocked domain?')) {
    return
  }
  
  try {
    const response = await $fetch(`/api/domains/blocked/${id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      await loadDomains()
      alert('Blocked domain deleted successfully!')
    } else {
      alert('Failed to delete blocked domain')
    }
  } catch (error) {
    console.error('Error deleting blocked domain:', error)
    alert('Failed to delete blocked domain')
  }
}

// Format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}
</script>
