<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/dashboard" class="text-xl font-bold text-gray-900">
              SafeHouse Admin
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/dashboard" class="text-gray-500 hover:text-gray-700">
              Back to Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Access Requests
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              Manage emergency access requests for your properties
            </p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ pendingRequests }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ approvedRequests }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Denied</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ deniedRequests }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ accessRequests.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Access Requests List -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Access Requests</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Review and approve emergency access requests
          </p>
        </div>
        
        <div v-if="loading" class="px-4 py-5 sm:px-6">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-sm text-gray-500">Loading requests...</p>
          </div>
        </div>

        <div v-else-if="accessRequests.length === 0" class="px-4 py-5 sm:px-6">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No access requests</h3>
            <p class="mt-1 text-sm text-gray-500">No emergency access requests have been submitted yet.</p>
          </div>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li v-for="request in accessRequests" :key="request.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg class="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ request.requester_name || 'Unknown' }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">
                      {{ request.requester_phone || request.requester_email }}
                    </p>
                    <p class="text-xs text-gray-400">
                      {{ formatDate(request.created_at) }}
                    </p>
                  </div>
                </div>
                
                <div class="mt-2">
                  <div class="flex items-center space-x-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClass(request.status)">
                      {{ request.status.toUpperCase() }}
                    </span>
                    <span class="text-sm text-gray-500">
                      Property: {{ request.property?.property_name }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-if="request.status === 'verified'" class="flex items-center space-x-2">
                <button
                  @click="approveRequest(request.id)"
                  :disabled="processing"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve
                </button>
                <button
                  @click="denyRequest(request.id)"
                  :disabled="processing"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deny
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const auth = useAuthStore()
const accessRequests = ref([])
const loading = ref(true)
const processing = ref(false)

// Computed properties for stats
const pendingRequests = computed(() => 
  accessRequests.value.filter(r => r.status === 'pending' || r.status === 'verified').length
)

const approvedRequests = computed(() => 
  accessRequests.value.filter(r => r.status === 'approved').length
)

const deniedRequests = computed(() => 
  accessRequests.value.filter(r => r.status === 'denied').length
)

onMounted(async () => {
  await loadAccessRequests()
})

async function loadAccessRequests() {
  loading.value = true
  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    if (!session) return

    // Get user's properties first
    const { data: properties } = await client
      .from('safehouse_properties')
      .select('id')
      .eq('user_id', session.user.id)

    if (!properties || properties.length === 0) {
      accessRequests.value = []
      return
    }

    // Get access requests for user's properties
    const { data, error } = await client
      .from('safehouse_access_requests')
      .select(`
        *,
        property:property_id (
          id,
          property_name,
          address
        )
      `)
      .in('property_id', properties.map(p => p.id))
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load access requests:', error)
      accessRequests.value = []
    } else {
      accessRequests.value = data || []
    }
  } catch (error) {
    console.error('Failed to load access requests:', error)
    accessRequests.value = []
  } finally {
    loading.value = false
  }
}

async function approveRequest(requestId: string) {
  processing.value = true
  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    if (!session) return

    const response = await $fetch('/api/access-requests/approve', {
      method: 'POST',
      body: {
        request_id: requestId,
        action: 'approve',
        approved_by_user_id: session.user.id
      }
    })

    if (response.success) {
      await loadAccessRequests() // Reload the list
      alert('Access request approved successfully!')
    }
  } catch (error) {
    console.error('Failed to approve request:', error)
    alert('Failed to approve request: ' + (error.data?.message || error.message))
  } finally {
    processing.value = false
  }
}

async function denyRequest(requestId: string) {
  processing.value = true
  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    if (!session) return

    const response = await $fetch('/api/access-requests/approve', {
      method: 'POST',
      body: {
        request_id: requestId,
        action: 'deny',
        approved_by_user_id: session.user.id
      }
    })

    if (response.success) {
      await loadAccessRequests() // Reload the list
      alert('Access request denied.')
    }
  } catch (error) {
    console.error('Failed to deny request:', error)
    alert('Failed to deny request: ' + (error.data?.message || error.message))
  } finally {
    processing.value = false
  }
}

function getStatusClass(status: string) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}
</script>
