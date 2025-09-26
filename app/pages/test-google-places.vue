<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Google Places API Test</h1>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Search Address:</label>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Enter an address..." 
          class="border p-2 rounded w-full"
          @input="searchAddresses"
        />
      </div>
      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Searching...</p>
      </div>
      <div v-if="error" class="p-4 bg-red-100 text-red-800 rounded">
        {{ error }}
      </div>
      <div v-if="results.length > 0" class="space-y-2">
        <h3 class="font-semibold">Results:</h3>
        <div v-for="(result, index) in results" :key="index" class="p-3 border rounded bg-gray-50">
          <p class="font-medium">{{ result.formatted_address }}</p>
          <p class="text-sm text-gray-600">Place ID: {{ result.place_id }}</p>
          <p class="text-sm text-gray-600">Lat: {{ result.lat }}, Lon: {{ result.lon }}</p>
          <div v-if="result.house_number || result.road" class="text-sm text-gray-500">
            <span v-if="result.house_number">{{ result.house_number }} </span>
            <span v-if="result.road">{{ result.road }}</span>
            <span v-if="result.postcode">, {{ result.postcode }}</span>
            <span v-if="result.city">, {{ result.city }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const searchQuery = ref('')
const results = ref([])
const loading = ref(false)
const error = ref('')

async function searchAddresses() {
  if (searchQuery.value.length < 3) {
    results.value = []
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/address-autocomplete', {
      query: {
        q: searchQuery.value
      }
    })
    
    if (response.success) {
      results.value = response.suggestions || []
    } else {
      error.value = response.message || 'Search failed'
      results.value = []
    }
  } catch (err) {
    error.value = 'Error: ' + (err.message || 'Unknown error')
    results.value = []
  } finally {
    loading.value = false
  }
}
</script>
