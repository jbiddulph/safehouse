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
              <NuxtLink to="/" class="text-2xl font-bold text-white">SafeHouse</NuxtLink>
            </div>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/auth/login" 
              class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors"
            >
              Sign In
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
            Select a payment option to get started with SafeHouse
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

        <!-- Continue Button -->
        <div class="text-center pt-6">
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
            Copyright © 2025 SafeHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const selectedOption = ref<'basic' | 'premium' | null>(null)

definePageMeta({ middleware: ['guest-only'] })

function selectOption(option: 'basic' | 'premium') {
  selectedOption.value = option
}

function continueToRegistration() {
  if (selectedOption.value) {
    navigateTo({
      path: '/auth/register',
      query: {
        plan: selectedOption.value
      }
    })
  }
}
</script>

