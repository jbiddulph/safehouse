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
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p class="text-gray-600">Manage user roles and system administration</p>
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

      <!-- Quick Actions Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <NuxtLink 
          to="/admin-access-logs" 
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Access Logs</h3>
              <p class="text-sm text-gray-500">View property access history and emergency requests</p>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink 
          to="/domains" 
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Domain Management</h3>
              <p class="text-sm text-gray-500">Manage allowed and blocked email domains</p>
            </div>
          </div>
        </NuxtLink>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">System Stats</h3>
              <p class="text-sm text-gray-500">View system statistics and health</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>
        
        <div v-if="loadingSettings" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading settings...</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Location Verification Distance -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Location Verification Distance (meters)
            </label>
            <p class="text-sm text-gray-500 mb-3">
              Maximum distance in meters for location verification when requesting emergency access. Users must be within this distance of the property to verify their location.
            </p>
            <div class="flex gap-4 items-center">
              <input
                v-model.number="settingsForm.location_verification_distance_meters"
                type="number"
                min="1"
                max="100000"
                class="w-32 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span class="text-sm text-gray-600">meters</span>
              <button
                @click="saveSettings"
                :disabled="savingSettings"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ savingSettings ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
            <p v-if="settingsSaved" class="mt-2 text-sm text-green-600">Settings saved successfully!</p>
          </div>
        </div>
      </div>

      <!-- User Management Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">User Role Management</h2>
        
        <!-- Search Users -->
        <div class="mb-6">
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search by email or name..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @input="searchUsers"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
              <select 
                v-model="roleFilter" 
                @change="searchUsers"
                class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="standard">Standard</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Users List -->
        <div v-if="users.length > 0" class="space-y-3">
          <div 
            v-for="user in users" 
            :key="user.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div class="flex items-center space-x-4">
              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ user.full_name || 'No Name' }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
                <div class="text-xs text-gray-400">
                  Joined {{ formatDate(user.created_at) }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span 
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ user.role === 'admin' ? 'Admin' : 'Standard' }}
              </span>
              <button 
                v-if="user.role === 'standard'"
                @click="promoteToAdmin(user.id)"
                :disabled="promotingUser === user.id"
                class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                {{ promotingUser === user.id ? 'Promoting...' : 'Make Admin' }}
              </button>
              <button 
                v-if="user.role === 'admin'"
                @click="demoteToStandard(user.id)"
                :disabled="demotingUser === user.id"
                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                {{ demotingUser === user.id ? 'Demoting...' : 'Make Standard' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="text-center py-8 text-gray-500">
          No users found
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>

      <!-- Admin Actions -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Admin Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink 
            to="/domains" 
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex-shrink-0">
              <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="font-medium text-gray-900">Domain Management</h3>
              <p class="text-sm text-gray-500">Manage allowed and blocked domains</p>
            </div>
          </NuxtLink>
          
          <div class="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="font-medium text-gray-900">System Analytics</h3>
              <p class="text-sm text-gray-500">View system usage and statistics</p>
            </div>
          </div>
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
const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const loading = ref(false)
const promotingUser = ref(null)
const demotingUser = ref(null)
const profile = ref(null)
const isAdmin = ref(false)

// Settings
const loadingSettings = ref(false)
const savingSettings = ref(false)
const settingsSaved = ref(false)
const settingsForm = ref({
  location_verification_distance_meters: 50
})

// Load profile and check admin access
onMounted(async () => {
  await loadProfile()
  if (isAdmin.value) {
    await loadUsers()
    await loadSettings()
  }
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

// Load users
async function loadUsers() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/users')
    if (response.success) {
      users.value = response.users
    }
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

// Search users
async function searchUsers() {
  if (!searchQuery.value && !roleFilter.value) {
    await loadUsers()
    return
  }
  
  loading.value = true
  try {
    const response = await $fetch('/api/admin/users', {
      query: {
        search: searchQuery.value,
        role: roleFilter.value
      }
    })
    if (response.success) {
      users.value = response.users
    }
  } catch (error) {
    console.error('Error searching users:', error)
  } finally {
    loading.value = false
  }
}

// Promote user to admin
async function promoteToAdmin(userId: string) {
  if (!confirm('Are you sure you want to promote this user to admin?')) {
    return
  }
  
  promotingUser.value = userId
  try {
    const response = await $fetch('/api/admin/promote', {
      method: 'POST',
      body: { user_id: userId }
    })
    
    if (response.success) {
      await loadUsers()
      alert('User promoted to admin successfully!')
    } else {
      alert('Failed to promote user')
    }
  } catch (error) {
    console.error('Error promoting user:', error)
    alert('Failed to promote user')
  } finally {
    promotingUser.value = null
  }
}

// Demote user to standard
async function demoteToStandard(userId: string) {
  if (!confirm('Are you sure you want to demote this user to standard role?')) {
    return
  }
  
  demotingUser.value = userId
  try {
    const response = await $fetch('/api/admin/demote', {
      method: 'POST',
      body: { user_id: userId }
    })
    
    if (response.success) {
      await loadUsers()
      alert('User demoted to standard role successfully!')
    } else {
      alert('Failed to demote user')
    }
  } catch (error) {
    console.error('Error demoting user:', error)
    alert('Failed to demote user')
  } finally {
    demotingUser.value = null
  }
}

// Format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

// Load settings
async function loadSettings() {
  loadingSettings.value = true
  try {
    const response = await $fetch('/api/admin/settings')
    if (response.success && response.settings) {
      // Populate form with settings
      if (response.settings.location_verification_distance_meters) {
        settingsForm.value.location_verification_distance_meters = parseInt(
          response.settings.location_verification_distance_meters.value,
          10
        ) || 50
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    // Keep default values on error
  } finally {
    loadingSettings.value = false
  }
}

// Save settings
async function saveSettings() {
  savingSettings.value = true
  settingsSaved.value = false
  
  try {
    // Validate the distance value
    const distance = settingsForm.value.location_verification_distance_meters
    if (!distance || distance < 1 || distance > 100000) {
      alert('Distance must be between 1 and 100,000 meters')
      return
    }

    const response = await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: {
        setting_key: 'location_verification_distance_meters',
        setting_value: distance,
        description: 'Maximum distance in meters for location verification when requesting emergency access'
      }
    })

    if (response.success) {
      settingsSaved.value = true
      setTimeout(() => {
        settingsSaved.value = false
      }, 3000)
    } else {
      alert('Failed to save settings')
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Failed to save settings: ' + (error.message || 'Unknown error'))
  } finally {
    savingSettings.value = false
  }
}
</script>
