<template>
  <div class="min-h-screen bg-[#f0f9fb] flex flex-col">
    <!-- Top Navigation -->
    <nav class="bg-[#03045e] shadow-lg border-b border-[#03045e]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Title -->
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0 flex items-center space-x-3">
              <div class="h-8 w-8 bg-[#ffffff] rounded-lg flex items-center justify-center">
                <img src="/images/logo.png" alt="SafeHouse" class="h-full w-full object-cover" />
              </div>
              <h1 class="text-2xl font-bold text-white">SafeHouse</h1>
            </div>
            
            <!-- Navigation Menu -->
            <nav class="hidden md:flex items-center space-x-6">
              <NuxtLink to="/about" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                About Us
              </NuxtLink>
              <NuxtLink to="/how-it-works" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                How It Works
              </NuxtLink>
              <NuxtLink to="/privacy-policy" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                Privacy Policy
              </NuxtLink>
              <NuxtLink to="/terms" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                Terms & Conditions
              </NuxtLink>
            </nav>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <NuxtLink 
              v-if="!isLoggedIn"
              to="/auth/login" 
              class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              v-if="!isLoggedIn"
              to="/auth/register" 
              class="px-4 py-2 text-sm font-medium text-white bg-[#8ee0ee] rounded-lg hover:bg-[#8ee0ee]/80 transition-colors"
            >
              Sign Up
            </NuxtLink>
            <NuxtLink 
              v-if="isLoggedIn"
              to="/dashboard" 
              class="px-4 py-2 text-sm font-medium text-white bg-[#8ee0ee] rounded-lg hover:bg-[#8ee0ee]/80 transition-colors"
            >
              Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden bg-[#03045e] border-t border-[#03045e]">
        <div class="px-4 py-4 space-y-3">
          <NuxtLink to="/about" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            About Us
          </NuxtLink>
          <NuxtLink to="/how-it-works" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            How It Works
          </NuxtLink>
          <NuxtLink to="/privacy-policy" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            Privacy Policy
          </NuxtLink>
          <NuxtLink to="/terms" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            Terms & Conditions
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="flex-1 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Map -->
      <div 
        ref="backgroundMapContainer" 
        class="absolute inset-0 w-full h-full pointer-events-none"
        style="z-index: 0; filter: grayscale(100%); opacity: 0.25;"
      ></div>
      
      <div class="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-[#03045e] mb-4">SafeHouse</h1>
        <p class="text-lg text-gray-600 mb-4">
          Enter an address to find properties or request emergency access
        </p>
        <div v-if="isLoggedIn" class="mb-4">
          <p class="text-sm text-[#03045e]">Welcome back, {{ userEmail }}!</p>
        </div>
      </div>

      <!-- Address Search -->
      <div class="bg-white py-8 px-6 shadow-lg rounded-lg">
        <div class="relative">
          <label for="address-input" class="block text-sm font-medium text-gray-700 mb-2">
            Property Address
          </label>
          <div class="relative">
            <input
              id="address-input"
              v-model="addressQuery"
              type="text"
              placeholder="Start typing an address..."
              class="w-full px-4 pr-14 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]"
              @input="handleAddressInput"
              @keydown.down="navigateSuggestions('down')"
              @keydown.up="navigateSuggestions('up')"
              @keydown.enter="selectSuggestion"
              @focus="handleInputFocus"
              @blur="hideSuggestions"
            />
            
            <!-- Search Button / Loading indicator -->
            <div class="absolute right-2 top-1/2 transform -translate-y-1/2">
              <button
                v-if="!loading && !searching"
                @click="searchProperties"
                :disabled="!addressQuery || !addressQuery.trim()"
                class="p-2 text-[#03045e] hover:text-[#8ee0ee] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <div v-else class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#03045e]"></div>
            </div>
          </div>

          <!-- Recent Searches -->
          <div 
            v-if="showRecentSearches && recentSearches.length > 0 && (!addressQuery || addressQuery.length === 0)" 
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div class="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              Recent Searches
            </div>
            <div
              v-for="(search, index) in recentSearches"
              :key="`recent-${index}`"
              class="px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              @click="selectRecentSearch(search)"
            >
              <div class="font-medium">{{ search.formatted_address }}</div>
              <div v-if="search.postcode" class="text-sm text-gray-500">
                {{ search.postcode }}
                <span v-if="search.city"> • {{ search.city }}</span>
                <span v-if="search.house_number" class="text-[#8ee0ee] font-medium">
                  • House #{{ search.house_number }}
                </span>
              </div>
              <div class="text-xs text-gray-400 mt-1">
                Searched {{ formatSearchTime(search.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Address Suggestions -->
          <div 
            v-if="showSuggestions && suggestions.length > 0" 
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="(suggestion, index) in suggestions"
              :key="index"
              :class="[
                'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0',
                selectedIndex === index ? 'bg-[#f0f9fb] text-[#03045e]' : 'hover:bg-gray-50'
              ]"
              @click="selectSuggestion(suggestion)"
              @mouseenter="selectedIndex = index"
            >
              <div class="font-medium">{{ suggestion.formatted_address }}</div>
              <div v-if="suggestion.postcode" class="text-sm text-gray-500">
                {{ suggestion.postcode }}
                <span v-if="suggestion.city"> • {{ suggestion.city }}</span>
                <span v-if="suggestion.house_number" class="text-[#8ee0ee] font-medium">
                  • House #{{ suggestion.house_number }}
                </span>
              </div>
              <div v-else-if="suggestion.types" class="text-sm text-gray-500">
                {{ suggestion.types?.join(', ') }}
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div 
            v-if="showSuggestions && suggestions.length === 0 && addressQuery && addressQuery.length > 2 && !loading"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500"
          >
            No addresses found. Try a different search term.
          </div>
        </div>

        <!-- Selected Address Display -->
        <div v-if="selectedAddress || (addressQuery && addressQuery.trim())" class="mt-4 p-4 bg-[#f0f9fb] border border-[#8ee0ee] rounded-lg">
          <h3 class="font-medium text-[#03045e] mb-1">Search Address:</h3>
          <p class="text-[#03045e]">{{ selectedAddress?.formatted_address || addressQuery || '' }}</p>
        </div>
      </div>

      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-[#03045e] border-t border-[#03045e] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-center">
          <p class="text-sm text-[#8ee0ee]">
            Copyright © 2025 SafeHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

// Reactive data
const addressQuery = ref('')
const suggestions = ref([])
const showMobileMenu = ref(false)
const selectedAddress = ref(null)
const selectedIndex = ref(-1)
const showSuggestions = ref(false)
const loading = ref(false)
const searching = ref(false)
const recentSearches = ref([])

// Background map for homepage
const backgroundMapContainer = ref<HTMLElement | null>(null)
const backgroundMap = ref<any>(null)
const showRecentSearches = ref(false)
const isLoggedIn = ref(false)
const userEmail = ref('')

// Debounce timer
let debounceTimer: NodeJS.Timeout | null = null

// Handle address input with debouncing
function handleAddressInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  if (!addressQuery.value || addressQuery.value.length < 3) {
    suggestions.value = []
    showSuggestions.value = false
    showRecentSearches.value = false
    return
  }
  
  showRecentSearches.value = false
  
  debounceTimer = setTimeout(async () => {
    await fetchAddressSuggestions()
  }, 300)
}

// Handle input focus
function handleInputFocus() {
  if ((!addressQuery.value || addressQuery.value.length === 0) && recentSearches.value.length > 0) {
    showRecentSearches.value = true
  } else if (addressQuery.value && addressQuery.value.length >= 3) {
    showSuggestions.value = true
  }
}

// Fetch address suggestions from server-side API
async function fetchAddressSuggestions() {
  if (!addressQuery.value || addressQuery.value.length < 3) return
  
  loading.value = true
  try {
    const response = await $fetch('/api/address-autocomplete', {
      query: {
        q: addressQuery.value
      }
    })
    
    if (response.success && response.suggestions) {
      suggestions.value = response.suggestions
    } else {
      console.error('Address autocomplete error:', response.message)
      suggestions.value = []
    }
    
    showSuggestions.value = true
    selectedIndex.value = -1
  } catch (error) {
    console.error('Error fetching address suggestions:', error)
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

// Navigate suggestions with keyboard
function navigateSuggestions(direction: 'up' | 'down') {
  if (suggestions.value.length === 0) return
  
  if (direction === 'down') {
    selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
  } else {
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  }
}

// Select a suggestion
function selectSuggestion(suggestion?: any) {
  if (suggestion) {
    selectedAddress.value = suggestion
    addressQuery.value = suggestion.formatted_address || ''
    addToRecentSearches(suggestion)
  } else if (selectedIndex.value >= 0 && suggestions.value[selectedIndex.value]) {
    selectedAddress.value = suggestions.value[selectedIndex.value]
    addressQuery.value = suggestions.value[selectedIndex.value]?.formatted_address || ''
    addToRecentSearches(suggestions.value[selectedIndex.value])
  } else {
    // If Enter is pressed but no suggestion is selected, trigger search with current input
    if (addressQuery.value && addressQuery.value.trim()) {
      searchProperties()
      return
    }
  }
  
  showSuggestions.value = false
  showRecentSearches.value = false
  selectedIndex.value = -1
}

// Select a recent search
function selectRecentSearch(search: any) {
  if (!search) return
  selectedAddress.value = search
  addressQuery.value = search?.formatted_address || ''
  showRecentSearches.value = false
  showSuggestions.value = false
}

// Hide suggestions
function hideSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false
    showRecentSearches.value = false
  }, 200)
}

// Search for properties at the selected address
async function searchProperties() {
  if (!addressQuery.value || !addressQuery.value.trim()) return
  
  searching.value = true
  try {
    // Use selectedAddress if available, otherwise create from input text
    const addressData = selectedAddress.value || {
      formatted_address: (addressQuery.value || '').trim(),
      city: '',
      state: '',
      postcode: '',
      country: 'GB' // Default to UK
    }
    
    // Ensure formatted_address is not empty
    if (!addressData.formatted_address || !addressData.formatted_address.trim()) {
      alert('Please enter a valid address')
      searching.value = false
      return
    }
    
    const searchParams = {
      address: addressData.formatted_address || '',
      city: addressData.city || '',
      state: addressData.state || '',
      postal_code: addressData.postcode || '',
      country: addressData.country || 'GB' // Default to UK
    }

    console.log('Searching properties with params:', searchParams)
    console.log('Calling API URL:', '/api/properties/search')
    console.log('Query params:', searchParams)

    const response = await $fetch('/api/properties/search', {
      query: searchParams
    })

    console.log('Search response:', response)
    
    if (response.success && response.properties) {
      if (response.properties.length > 0) {
        // Show search results
        showSearchResults(response.properties)
      } else {
        // No properties found
        showNoPropertiesFound()
      }
    } else {
      console.error('Property search error:', response)
      alert('Failed to search properties: ' + (response.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error searching properties:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    })
    alert('Failed to search properties: ' + (error.message || 'Network error'))
  } finally {
    searching.value = false
  }
}

// Show search results
function showSearchResults(properties: any[]) {
  const resultsHtml = properties.map(property => `
    <div class="border border-gray-200 rounded-lg p-4 mb-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors" 
         onclick="window.location.href='/property/${property.id}'">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-semibold text-lg text-gray-900">${property.property_name}</h3>
          <p class="text-gray-600">${property.address}</p>
          <p class="text-sm text-gray-500">
            ${property.city}${property.state ? `, ${property.state}` : ''} ${property.postal_code || ''}
          </p>
          <p class="text-sm text-gray-500">${property.country}</p>
        </div>
        <div class="text-right">
          <span class="inline-block px-2 py-1 text-xs font-medium bg-[#f0f9fb] text-[#03045e] rounded-full">
            ${property.property_type}
          </span>
          ${property.emergency_access_enabled ? 
            '<span class="block mt-1 text-xs text-[#8ee0ee] font-medium">Emergency Access Available</span>' : 
            '<span class="block mt-1 text-xs text-red-600 font-medium">Emergency Access Disabled</span>'
          }
        </div>
      </div>
      <div class="mt-2 text-sm text-[#8ee0ee] font-medium">
        Click to view property details →
      </div>
    </div>
  `).join('')

  // Create modal or show results
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Properties Found (${properties.length})</h2>
          <p class="text-sm text-gray-600 mt-1">Click on any property to view details</p>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="space-y-3">
        ${resultsHtml}
      </div>
      <div class="mt-6 text-center">
        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-[#03045e] text-white rounded-lg hover:bg-[#03045e]">
          Close
        </button>
      </div>
    </div>
  `
  
  document.body.appendChild(modal)
}

// Show no properties found message
function showNoPropertiesFound() {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
      <div class="mb-4">
        <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-900 mb-2">No Properties Found</h2>
      <p class="text-gray-600 mb-6">
        No SafeHouse properties were found at this address. 
        The property may not be registered in our system yet.
      </p>
      <div class="space-y-3">
        <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 bg-[#03045e] text-white rounded-lg hover:bg-[#03045e]">
          Close
        </button>
        <button onclick="this.closest('.fixed').remove(); window.location.href='/auth/register'" class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Register Property
        </button>
      </div>
    </div>
  `
  
  document.body.appendChild(modal)
}

// Add to recent searches
function addToRecentSearches(address: any) {
  const searchEntry = {
    ...address,
    timestamp: Date.now()
  }
  
  // Remove if already exists
  recentSearches.value = recentSearches.value.filter(
    search => search.formatted_address !== address.formatted_address
  )
  
  // Add to beginning
  recentSearches.value.unshift(searchEntry)
  
  // Keep only last 10
  recentSearches.value = recentSearches.value.slice(0, 10)
  
  // Save to localStorage
  if (process.client) {
    localStorage.setItem('safehouse_recent_searches', JSON.stringify(recentSearches.value))
  }
}

// Format search time
function formatSearchTime(timestamp: number) {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) { // Less than 1 minute
    return 'just now'
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diff / 86400000)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

// Load recent searches from localStorage
function loadRecentSearches() {
  if (process.client) {
    try {
      const stored = localStorage.getItem('safehouse_recent_searches')
      if (stored) {
        recentSearches.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }
}

// Check authentication status
async function checkAuthStatus() {
  try {
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      isLoggedIn.value = true
      userEmail.value = session.user.email || ''
    } else {
      isLoggedIn.value = false
      userEmail.value = ''
    }
  } catch (error) {
    console.error('Error checking auth status:', error)
    isLoggedIn.value = false
    userEmail.value = ''
  }
}

// Sign out function
async function signOut() {
  try {
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
    isLoggedIn.value = false
    userEmail.value = ''
    // Optionally redirect to home page
    await navigateTo('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// Initialize background map
function initBackgroundMap() {
  if (!backgroundMapContainer.value) return
  if (typeof window === 'undefined') return
  
  nextTick(() => {
    if (!backgroundMapContainer.value) return
    
    const { initMap } = useMapbox()
    
    // Worthing, UK coordinates: -0.3750, 50.8175
    backgroundMap.value = initMap(backgroundMapContainer.value, {
      center: [-0.3750, 50.8175], // Worthing, UK
      zoom: 18,
      // Disable all interactions for locked map
      touchZoomRotate: false,
      touchPitch: false,
      doubleClickZoom: false,
      dragRotate: false,
      dragPan: false,
      scrollZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false
    })
    
    if (backgroundMap.value) {
      // Disable all interactions programmatically
      backgroundMap.value.dragPan.disable()
      backgroundMap.value.dragRotate.disable()
      backgroundMap.value.scrollZoom.disable()
      backgroundMap.value.boxZoom.disable()
      backgroundMap.value.doubleClickZoom.disable()
      backgroundMap.value.touchZoomRotate.disable()
      backgroundMap.value.touchPitch.disable()
      backgroundMap.value.keyboard.disable()
      
      // Apply monochrome filter and opacity after map loads
      backgroundMap.value.on('load', () => {
        if (backgroundMapContainer.value) {
          // Apply CSS filter for monochrome and opacity to the canvas
          const mapCanvas = backgroundMapContainer.value.querySelector('canvas')
          if (mapCanvas) {
            mapCanvas.style.filter = 'grayscale(100%)'
            mapCanvas.style.opacity = '0.25'
          }
          
          // Also apply to container for consistency
          backgroundMapContainer.value.style.filter = 'grayscale(100%)'
        }
      })
      
      // Force resize for proper rendering
      setTimeout(() => {
        if (backgroundMap.value) {
          backgroundMap.value.resize()
        }
      }, 100)
    }
  })
}

// Initialize recent searches and auth status
onMounted(() => {
  loadRecentSearches()
  checkAuthStatus()
  
  // Initialize background map
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      initBackgroundMap()
    }, 500)
  }
})

// Clear search when component unmounts
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Cleanup background map
  if (backgroundMap.value) {
    try {
      backgroundMap.value.remove()
    } catch (e) {
      // Map might already be removed
    }
    backgroundMap.value = null
  }
})
</script>
