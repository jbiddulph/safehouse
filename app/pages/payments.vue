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
                <img src="/images/logo.png" alt="MySafeHouse" class="h-full w-full object-cover" />
              </div>
              <NuxtLink
                :to="isLoggedIn ? '/dashboard' : '/'"
                class="text-xl font-bold text-white no-underline hover:no-underline"
              >
                MySafeHouse
              </NuxtLink>
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
              :class="[
                'text-sm font-medium text-[#8ee0ee] hover:text-white no-underline hover:no-underline transition-colors',
                $route.path === '/auth/login' ? 'text-white border-b-2 border-white pb-1' : ''
              ]"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              v-if="!isLoggedIn"
              to="/auth/register" 
              :class="[
                'text-sm font-medium text-[#8ee0ee] hover:text-white no-underline hover:no-underline transition-colors',
                $route.path === '/auth/register' ? 'text-white border-b-2 border-white pb-1' : ''
              ]"
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
    </nav>

    <div class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl w-full mx-auto space-y-8">
        <!-- Header Text -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-[#03045e] mb-2">Choose Your Plan</h2>
          <p class="text-lg text-gray-600">
            Select a payment option to get started with MySafeHouse
          </p>
        </div>

        <!-- Payment Options -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Option 1: Basic Plan -->
          <div 
            class="bg-white rounded-lg shadow-xl p-8 border-2 transition-all cursor-pointer hover:border-[#8ee0ee]"
            :class="selectedOption === 'basic' ? 'border-[#03045e]' : 'border-gray-200'"
            @click="selectOption('basic')"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-[#03045e]">Basic Plan</h3>
              <div 
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                :class="selectedOption === 'basic' ? 'border-[#03045e] bg-[#03045e]' : 'border-gray-300'"
              >
                <div 
                  v-if="selectedOption === 'basic'"
                  class="w-3 h-3 rounded-full bg-white"
                ></div>
              </div>
            </div>
            <div class="mb-6">
              <div class="flex items-baseline">
                <span class="text-4xl font-bold text-[#03045e]">£24</span>
                <span class="text-gray-600 ml-2">/year</span>
              </div>
            </div>
            <ul class="space-y-3 mb-6">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-[#8ee0ee] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700">1 Property included</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-[#8ee0ee] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700">Full access to all features</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-[#8ee0ee] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700">Yearly subscription</span>
              </li>
            </ul>
          </div>

          <!-- Option 2: Premium Plan -->
          <div 
            class="bg-white rounded-lg shadow-xl p-8 border-2 transition-all cursor-pointer hover:border-[#8ee0ee]"
            :class="selectedOption === 'premium' ? 'border-[#03045e]' : 'border-gray-200'"
            @click="selectOption('premium')"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-[#03045e]">Premium Plan</h3>
              <div 
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                :class="selectedOption === 'premium' ? 'border-[#03045e] bg-[#03045e]' : 'border-gray-300'"
              >
                <div 
                  v-if="selectedOption === 'premium'"
                  class="w-3 h-3 rounded-full bg-white"
                ></div>
              </div>
            </div>
            <div class="mb-6">
              <div class="flex items-baseline">
                <span class="text-4xl font-bold text-[#03045e]">£24</span>
                <span class="text-gray-600 ml-2">/year</span>
              </div>
              <p class="text-sm text-gray-600 mt-2">+ £12 per additional credit</p>
            </div>
            <ul class="space-y-3 mb-6">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-[#8ee0ee] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700">1 Property included</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-[#8ee0ee] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700">Add additional credits</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-[#8ee0ee] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700">Full access to all features</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-[#8ee0ee] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700">Yearly subscription</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Buy Credits Section (for existing users) -->
        <div v-if="isBuyingCredits" class="bg-white rounded-lg shadow-xl p-8 border-2 border-[#03045e]">
          <h3 class="text-2xl font-bold text-[#03045e] mb-4">Purchase Additional Credits</h3>
          <p class="text-gray-600 mb-6">Each credit allows you to add one additional property. Credits are £12 per year.</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Number of Credits</label>
              <input
                v-model.number="additionalCreditsToBuy"
                type="number"
                min="1"
                max="5"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              />
              <p class="text-xs text-gray-500 mt-1">Maximum 5 properties per account. Each credit = 1 property.</p>
            </div>
            
            <div class="bg-[#f0f9fb] p-4 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Total Cost:</span>
                <span class="text-xl font-bold text-[#03045e]">£{{ additionalCreditsToBuy * 12 }}/year</span>
              </div>
            </div>
            
            <UButton 
              @click="purchaseAdditionalCredits"
              size="lg"
              block
              class="bg-[#03045e] hover:bg-[#03045e] text-white font-semibold py-3 px-8 rounded-lg"
            >
              Purchase Credits
            </UButton>
          </div>
        </div>

        <!-- Continue Button (for new users) -->
        <div v-else class="text-center pt-6">
          <UButton 
            :disabled="!selectedOption"
            @click="continueToRegistration"
            size="lg"
            class="bg-[#03045e] hover:bg-[#03045e] text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Create Account
          </UButton>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-[#03045e] border-t border-[#03045e] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-center">
          <p class="text-sm text-[#8ee0ee]">
            Copyright © 2025 MySafeHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const selectedOption = ref<'basic' | 'premium' | null>(null)
const isBuyingCredits = ref(false)
const additionalCreditsToBuy = ref(1)
const isLoggedIn = ref(false)

// Allow both guests (for registration) and authenticated users (for buying credits)
definePageMeta({
  title: 'Payments',
  meta: [
    {
      name: 'description',
      content: 'Choose or manage your MySafeHouse subscription so emergency services can securely access your property when needed.'
    }
  ]
})

onMounted(async () => {
  try {
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    isLoggedIn.value = !!session?.user
  } catch (error) {
    console.error('Error checking auth status on payments page:', error)
    isLoggedIn.value = false
  }

  // Check if user is buying additional credits
  if (route.query.action === 'buy-credits') {
    isBuyingCredits.value = true
    // Redirect to login if not authenticated
    const client = useSupabaseClient()
    client.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigateTo('/auth/login?redirect=/payments?action=buy-credits')
      }
    })
  }
})

function selectOption(option: 'basic' | 'premium') {
  selectedOption.value = option
}

async function continueToRegistration() {
  if (selectedOption.value) {
    navigateTo({
      path: '/auth/register',
      query: {
        plan: selectedOption.value
      }
    })
  }
}

async function purchaseAdditionalCredits() {
  if (additionalCreditsToBuy.value < 1) {
    alert('Please select at least 1 credit')
    return
  }

  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    
    if (!session) {
      navigateTo('/auth/login')
      return
    }

    const response = await $fetch('/api/stripe/purchase-credits', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${session.access_token}`
      },
      body: {
        additionalCredits: additionalCreditsToBuy.value
      }
    })

    if (response.checkoutUrl) {
      window.location.href = response.checkoutUrl
    } else if (response.success) {
      alert('Credits added successfully!')
      navigateTo('/dashboard')
    }
  } catch (error: any) {
    console.error('Failed to purchase credits:', error)
    alert('Failed to purchase credits: ' + (error.data?.message || error.message))
  }
}
</script>

