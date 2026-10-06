<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="text-center mb-6">
        <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
          <Icon name="mdi:check-circle" class="h-8 w-8 text-green-600" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Access Approved</h1>
        <p class="mt-2 text-sm text-gray-600">
          The property owner has granted your emergency access request.
        </p>
      </div>

      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#03045e] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading access details...</p>
        </div>

        <div v-else-if="error" class="text-center py-6">
          <Icon name="mdi:alert-circle" class="mx-auto h-12 w-12 text-red-400 mb-3" />
          <h2 class="text-lg font-medium text-gray-900 mb-2">Unable to load details</h2>
          <p class="text-sm text-gray-500 mb-6">{{ error }}</p>
          <p class="text-sm text-gray-500">
            Check your email for the approval message with access details.
          </p>
        </div>

        <div v-else class="space-y-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-sm text-green-800">
              These are the same details sent to your email.
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-500 mb-1">Property</p>
            <p class="text-lg font-semibold text-gray-900">{{ propertyName }}</p>
            <p v-if="propertyAddress" class="text-sm text-gray-600 mt-2">{{ propertyAddress }}</p>
          </div>

          <div v-if="hasKeysafeInfo" class="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
            <h2 class="text-base font-semibold text-blue-900 flex items-center gap-2">
              <Icon name="mdi:key" class="h-5 w-5" />
              Keysafe Information
            </h2>

            <div v-if="keysafe?.image_url" class="space-y-1">
              <p class="text-sm font-medium text-blue-900">Keysafe Image</p>
              <img
                :src="keysafe.image_url"
                alt="Keysafe location"
                class="w-full rounded-md border border-blue-200 bg-white"
              />
            </div>

            <p v-if="keysafe?.location" class="text-sm text-blue-900">
              <span class="font-medium">Location:</span> {{ keysafe.location }}
            </p>

            <p v-if="keysafe?.code" class="text-sm text-blue-900">
              <span class="font-medium">Access Code:</span>
              <code class="ml-1 inline-block bg-white border border-blue-200 rounded px-2 py-1 font-mono text-base font-bold tracking-wide">
                {{ keysafe.code }}
              </code>
            </p>

            <p v-if="keysafe?.what3words" class="text-sm text-blue-900">
              <span class="font-medium">What3Words:</span>
              <a
                :href="what3WordsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-1 text-[#03045e] underline"
              >
                {{ keysafe.what3words }}
              </a>
            </p>

            <p v-if="keysafe?.latitude != null && keysafe?.longitude != null" class="text-sm text-blue-900">
              <span class="font-medium">Coordinates:</span>
              {{ formatCoordinate(keysafe.latitude) }}, {{ formatCoordinate(keysafe.longitude) }}
            </p>

            <div v-if="keysafe?.notes" class="pt-2 border-t border-blue-200">
              <p class="text-sm font-medium text-blue-900 mb-1">Additional Notes</p>
              <p class="text-sm text-blue-900 whitespace-pre-wrap">{{ keysafe.notes }}</p>
            </div>
          </div>

          <p class="text-sm text-gray-600">
            {{
              hasKeysafeInfo
                ? 'Please use the keysafe information above to access the property safely.'
                : 'Please follow any additional instructions provided by the owner to access the property safely.'
            }}
          </p>

          <NuxtLink
            to="/"
            class="w-full inline-flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#03045e] hover:bg-[#020347]"
          >
            Back to Home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false
})

useSeoMeta({
  title: 'Access Approved',
  description: 'Your MySafeHouse emergency access request was approved.'
})

type KeysafeInfo = {
  location?: string | null
  code?: string | null
  what3words?: string | null
  latitude?: number | null
  longitude?: number | null
  notes?: string | null
  image_url?: string | null
}

const route = useRoute()
const loading = ref(true)
const error = ref('')
const propertyName = ref('')
const propertyAddress = ref('')
const keysafe = ref<KeysafeInfo | null>(null)

const hasKeysafeInfo = computed(() => {
  const k = keysafe.value
  if (!k) return false
  return !!(
    k.location ||
    k.code ||
    k.what3words ||
    k.latitude != null ||
    k.notes ||
    k.image_url
  )
})

const what3WordsUrl = computed(() => {
  const w3w = keysafe.value?.what3words
  if (!w3w) return '#'
  return `https://what3words.com/${w3w.replace(/\s+/g, '.')}`
})

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

onMounted(async () => {
  const requestId = typeof route.query.request_id === 'string' ? route.query.request_id : ''
  const token = typeof route.query.token === 'string' ? route.query.token : ''

  if (!requestId || !token) {
    error.value = 'This approval link is missing required information.'
    loading.value = false
    return
  }

  try {
    const response = await $fetch<{
      success: boolean
      status: string
      property_name?: string | null
      property_address?: string | null
      keysafe?: KeysafeInfo | null
    }>('/api/access-requests/status', {
      query: {
        request_id: requestId,
        token
      }
    })

    if (response.status === 'approved') {
      propertyName.value = response.property_name || 'Property'
      propertyAddress.value = response.property_address || ''
      keysafe.value = response.keysafe || null
    } else if (response.status === 'denied') {
      await navigateTo('/access/denied')
      return
    } else if (response.status === 'pending' || response.status === 'verified') {
      error.value = 'This request is still waiting for a decision from the property owner.'
    } else if (response.status === 'expired') {
      error.value = 'This access request has expired. Please submit a new request.'
    } else {
      error.value = 'Access details are not available for this request.'
    }
  } catch (err: any) {
    console.error('Failed to load approved access details:', err)
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load access details.'
  } finally {
    loading.value = false
  }
})
</script>
