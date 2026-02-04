<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <NuxtLink 
            to="/admin" 
            class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <Icon name="mdi:arrow-left" class="mr-2 h-4 w-4" />
            Back to Admin Panel
          </NuxtLink>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">NFC Codes Management</h1>
            <p class="text-gray-600">Manage NFC codes and assign them to properties</p>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search NFC Code</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="e.g., 26-1, 26-100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]"
              @input="searchNfcCodes"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Assignment</label>
            <select
              v-model="assignmentFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]"
              @change="loadNfcCodes"
            >
              <option value="">All Codes</option>
              <option value="assigned">Assigned to Properties</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadNfcCodes"
              class="w-full px-4 py-2 bg-[#03045e] text-white rounded-md hover:bg-[#023e8a] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03045e] mx-auto mb-4"></div>
        <p class="text-gray-600">Loading NFC codes...</p>
      </div>

      <!-- NFC Codes Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">NFC Codes ({{ filteredNfcCodes.length }})</h2>
        </div>
        <div v-if="filteredNfcCodes.length === 0 && !loading" class="p-12 text-center">
          <Icon name="mdi:nfc" class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 mb-2">No NFC codes found</p>
          <p class="text-sm text-gray-500 mb-4">Make sure the database migration has been run and the NFC codes table has been populated.</p>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
            <p class="text-sm font-medium text-yellow-800 mb-2">To populate NFC codes:</p>
            <ol class="text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Run the SQL migration file: <code class="bg-yellow-100 px-1 rounded">prisma/migrations/0020_add_nfc_codes/migration.sql</code></li>
              <li>This will create the tables and insert 10,000 NFC codes (26-1 to 26-10000)</li>
              <li>Refresh this page after running the migration</li>
            </ol>
          </div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Properties</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="nfcCode in paginatedNfcCodes" :key="nfcCode.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">{{ nfcCode.code_id }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <a
                    :href="formatNfcUrl(nfcCode.code_id)"
                    class="text-sm text-[#03045e] hover:underline break-all"
                    target="_blank"
                    rel="noopener"
                  >
                    {{ formatNfcUrl(nfcCode.code_id) }}
                  </a>
                </td>
                <td class="px-6 py-4">
                  <div v-if="nfcCode.properties && nfcCode.properties.length > 0" class="space-y-2">
                    <div
                      v-for="property in nfcCode.properties"
                      :key="property.id"
                      class="flex flex-col p-2 rounded-md bg-[#f0f9fb] text-[#03045e] mb-2"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <div class="text-sm font-medium">{{ property.property_name }}</div>
                          <div class="text-xs text-gray-600 mt-0.5">{{ property.address }}</div>
                        </div>
                        <button
                          @click="removePropertyFromNfc(nfcCode.id, property.id)"
                          class="ml-2 text-red-600 hover:text-red-800 flex-shrink-0"
                          title="Remove property"
                        >
                          <Icon name="mdi:close" class="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <span v-else class="text-sm text-gray-400">No properties assigned</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openAssignModal(nfcCode)"
                    class="text-[#8ee0ee] hover:text-[#03045e] mr-4"
                  >
                    Assign Property
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredNfcCodes.length) }} of {{ filteredNfcCodes.length }} codes
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Property Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeAssignModal">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Assign Property to {{ selectedNfcCode?.code_id }}</h3>
          <button
            @click="closeAssignModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon name="mdi:close" class="h-6 w-6" />
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Property</label>
          <select
            v-model="selectedPropertyId"
            :disabled="assigning || availableProperties.length === 0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee] disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Select a property --</option>
            <option
              v-for="property in availableProperties"
              :key="property.id"
              :value="property.id"
            >
              {{ property.property_name }} - {{ property.address }}
            </option>
          </select>
          <p v-if="availableProperties.length === 0" class="mt-1 text-xs text-gray-500">
            Loading properties...
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeAssignModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="assignPropertyToNfc"
            :disabled="!selectedPropertyId || assigning"
            class="px-4 py-2 text-sm font-medium text-white bg-[#03045e] rounded-md hover:bg-[#023e8a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ assigning ? 'Assigning...' : 'Assign Property' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const nfcCodes = ref([])
const filteredNfcCodes = ref([])
const searchQuery = ref('')
const assignmentFilter = ref('')
const loading = ref(false)
const showAssignModal = ref(false)
const selectedNfcCode = ref(null)
const selectedPropertyId = ref('')
const assigning = ref(false)
const availableProperties = ref([])
const currentPage = ref(1)
const itemsPerPage = 50

const profile = ref(null)
const isAdmin = ref(false)
const runtimeConfig = useRuntimeConfig()
const baseUrl = computed(() => runtimeConfig.public.baseUrl || '')

onMounted(async () => {
  await loadProfile()
  if (isAdmin.value) {
    await loadNfcCodes()
    await loadProperties()
  }
})

async function loadProfile() {
  try {
    const auth = useAuthStore()
    profile.value = await auth.getProfile()
    isAdmin.value = profile.value?.role === 'admin'
    
    if (!isAdmin.value) {
      await navigateTo('/dashboard')
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    await navigateTo('/dashboard')
  }
}

async function loadNfcCodes() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/nfc-codes', {
      query: {
        search: searchQuery.value || undefined,
        filter: assignmentFilter.value || undefined
      }
    })
    if (response.success) {
      nfcCodes.value = response.nfcCodes || []
      filterNfcCodes()
    } else {
      console.error('API returned success:false', response)
      alert('Failed to load NFC codes: ' + (response.message || 'Unknown error'))
    }
  } catch (error: any) {
    console.error('Error loading NFC codes:', error)
    const errorMessage = error.data?.message || error.message || 'Unknown error'
    alert('Failed to load NFC codes: ' + errorMessage)
    nfcCodes.value = []
    filteredNfcCodes.value = []
  } finally {
    loading.value = false
  }
}

function filterNfcCodes() {
  let filtered = [...nfcCodes.value]
  
  if (assignmentFilter.value === 'assigned') {
    filtered = filtered.filter(code => code.properties && code.properties.length > 0)
  } else if (assignmentFilter.value === 'unassigned') {
    filtered = filtered.filter(code => !code.properties || code.properties.length === 0)
  }
  
  filteredNfcCodes.value = filtered
  currentPage.value = 1
}

function searchNfcCodes() {
  filterNfcCodes()
}

async function loadProperties() {
  try {
    // Load all properties (admin can see all properties)
    const response = await $fetch('/api/properties')
    if (response.properties) {
      availableProperties.value = response.properties
    } else {
      console.warn('No properties returned from API')
      availableProperties.value = []
    }
  } catch (error) {
    console.error('Error loading properties:', error)
    alert('Failed to load properties. Please refresh the page.')
    availableProperties.value = []
  }
}

function openAssignModal(nfcCode: any) {
  selectedNfcCode.value = nfcCode
  selectedPropertyId.value = ''
  showAssignModal.value = true
}

function closeAssignModal() {
  showAssignModal.value = false
  selectedNfcCode.value = null
  selectedPropertyId.value = ''
}

async function assignPropertyToNfc() {
  if (!selectedNfcCode.value || !selectedPropertyId.value) return
  
  assigning.value = true
  try {
    const response = await $fetch('/api/admin/nfc-codes/assign', {
      method: 'POST',
      body: {
        nfc_code_id: selectedNfcCode.value.id,
        property_id: selectedPropertyId.value
      }
    })
    
    if (response.success) {
      // Show success message
      const propertyName = availableProperties.value.find((p: any) => p.id === selectedPropertyId.value)?.property_name || 'Property'
      alert(`Success! ${propertyName} has been assigned to NFC code ${selectedNfcCode.value.code_id}`)
      await loadNfcCodes()
      closeAssignModal()
    } else {
      alert('Failed to assign property: ' + (response.message || 'Unknown error'))
    }
  } catch (error: any) {
    console.error('Error assigning property:', error)
    const errorMessage = error.data?.message || error.message || 'Network error'
    alert('Failed to assign property: ' + errorMessage)
  } finally {
    assigning.value = false
  }
}

async function removePropertyFromNfc(nfcCodeId: string, propertyId: string) {
  if (!confirm('Are you sure you want to remove this property assignment?')) return
  
  try {
    const response = await $fetch('/api/admin/nfc-codes/unassign', {
      method: 'POST',
      body: {
        nfc_code_id: nfcCodeId,
        property_id: propertyId
      }
    })
    
    if (response.success) {
      await loadNfcCodes()
    } else {
      alert('Failed to remove property assignment: ' + (response.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error removing property assignment:', error)
    alert('Failed to remove property assignment: ' + (error.message || 'Network error'))
  }
}

const totalPages = computed(() => Math.ceil(filteredNfcCodes.value.length / itemsPerPage))

const paginatedNfcCodes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredNfcCodes.value.slice(start, end)
})

function formatNfcUrl(codeId: string) {
  const trimmedBase = baseUrl.value ? baseUrl.value.replace(/\/+$/, '') : ''
  if (!trimmedBase) return `/nfc/${codeId}`
  return `${trimmedBase}/nfc/${codeId}`
}
</script>
