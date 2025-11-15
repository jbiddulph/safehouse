<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <NuxtLink 
            to="/admin" 
            class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin Panel
          </NuxtLink>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Access Logs</h1>
          <p class="mt-2 text-gray-600">Monitor property page visits and emergency access requests</p>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-[#8ee0ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Accesses (30 days)</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ summary.totalAccesses }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Emergency Requests</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ summary.accessTypes.emergency_request || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-[#8ee0ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Access Granted</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ summary.accessTypes.access_granted || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Mobile Accesses</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ summary.deviceTypes.mobile || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Email, device, property..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]0"
                @input="debouncedSearch"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Access Type</label>
              <select
                v-model="filters.accessType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]0"
                @change="loadLogs"
              >
                <option value="">All Types</option>
                <option value="property_view">Property View</option>
                <option value="emergency_request">Emergency Request</option>
                <option value="access_granted">Access Granted</option>
                <option value="access_denied">Access Denied</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
              <select
                v-model="filters.deviceType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]0"
                @change="loadLogs"
              >
                <option value="">All Devices</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                v-model="filters.startDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]0"
                @change="loadLogs"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                v-model="filters.endDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]0"
                @change="loadLogs"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Access Logs</h3>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03045e] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading access logs...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-600">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p class="mt-2 text-sm text-red-600">{{ error }}</p>
          </div>
        </div>

        <!-- Table -->
        <div v-else-if="logs.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDateTime(log.created_at) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div class="font-medium">{{ log.safehouse_properties?.property_name || 'Unknown' }}</div>
                    <div class="text-gray-500">{{ log.safehouse_properties?.address || 'No address' }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div v-if="log.user_email" class="font-medium">{{ log.user_email }}</div>
                    <div v-if="log.phone_number" class="text-gray-500">{{ log.phone_number }}</div>
                    <div v-else class="text-gray-500">Anonymous</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getAccessTypeBadgeClass(log.access_type)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatAccessType(log.access_type) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div class="font-medium">{{ formatDevice(log) }}</div>
                    <div class="text-gray-500">{{ log.browser_name }} {{ log.browser_version }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.ip_address }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <div class="flex items-center space-x-3">
                    <AccessLogMap 
                      :latitude="log.latitude"
                      :longitude="log.longitude"
                      :country="log.country"
                      :region="log.region"
                      :city="log.city"
                      :ip-address="log.ip_address"
                    />
                    <div>
                      <div v-if="log.city || log.country" class="text-xs">
                        {{ log.city }}{{ log.city && log.country ? ', ' : '' }}{{ log.country }}
                      </div>
                      <div v-else class="text-xs text-gray-400">Unknown</div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No access logs found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                  to
                  <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                  of
                  <span class="font-medium">{{ pagination.total }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="changePage(pagination.page - 1)"
                    :disabled="pagination.page <= 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    v-for="page in getVisiblePages()"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === pagination.page
                        ? 'z-10 bg-[#f0f9fb] border-[#8ee0ee]0 text-[#8ee0ee]'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <button
                    @click="changePage(pagination.page + 1)"
                    :disabled="pagination.page >= pagination.totalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
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
const logs = ref([])
const summary = ref({
  totalAccesses: 0,
  accessTypes: {},
  deviceTypes: {},
  dailyAccesses: {}
})
const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0
})
const loading = ref(false)
const error = ref('')

// Filters
const filters = ref({
  search: '',
  accessType: '',
  deviceType: '',
  startDate: '',
  endDate: ''
})

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadLogs()
  }, 500)
}

// Load logs
const loadLogs = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const query = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters.value).filter(([_, value]) => value)
      )
    })

    const response = await $fetch(`/api/admin/access-logs?${query}`)
    
    if (response.success) {
      logs.value = response.data.logs
      pagination.value = response.data.pagination
      summary.value = response.data.summary
    } else {
      error.value = 'Failed to load access logs'
    }
  } catch (err) {
    console.error('Error loading access logs:', err)
    error.value = 'Failed to load access logs'
  } finally {
    loading.value = false
  }
}

// Change page
const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    loadLogs()
  }
}

// Get visible pages for pagination
const getVisiblePages = () => {
  const pages = []
  const start = Math.max(1, pagination.value.page - 2)
  const end = Math.min(pagination.value.totalPages, pagination.value.page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Format functions
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const formatAccessType = (type: string) => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatDevice = (log: any) => {
  const parts = []
  if (log.device_make) parts.push(log.device_make)
  if (log.device_model) parts.push(log.device_model)
  if (parts.length === 0) parts.push(log.device_type || 'Unknown')
  return parts.join(' ')
}

const getAccessTypeBadgeClass = (type: string) => {
  const classes = {
    property_view: 'bg-[#f0f9fb] text-[#03045e]',
    emergency_request: 'bg-red-100 text-red-800',
    access_granted: 'bg-[#f0f9fb] text-[#03045e]',
    access_denied: 'bg-gray-100 text-gray-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

// Load logs on mount
onMounted(() => {
  loadLogs()
})
</script>
