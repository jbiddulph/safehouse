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
              <NuxtLink to="/" class="text-xl font-bold text-white">MySafeHouse</NuxtLink>
            </div>
            
            <!-- Navigation Menu -->
            <nav class="hidden md:flex items-center space-x-6">
              <NuxtLink to="/about" class="text-sm font-medium text-white border-b-2 border-[#8ee0ee] pb-1">
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

    <!-- Main Content -->
    <div class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-4xl font-bold text-[#03045e] mb-6">About Us</h1>
        
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-700 mb-4">
            MySafeHouse is a comprehensive property access management platform designed to provide secure, 
            convenient, and emergency access solutions for property owners and authorized users.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Our Mission</h2>
          <p class="text-gray-700 mb-4">
            Our mission is to revolutionize property access management by providing a secure, user-friendly 
            platform that enables property owners to grant controlled access to their properties while 
            maintaining the highest standards of security and convenience.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">What We Offer</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Emergency access management for authorized personnel</li>
            <li>QR code and NFC-based access systems</li>
            <li>Secure access code generation and management</li>
            <li>Real-time access logging and monitoring</li>
            <li>Property contact management</li>
            <li>Location-based access verification</li>
          </ul>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Our Commitment</h2>
          <p class="text-gray-700 mb-4">
            At MySafeHouse, we are committed to protecting your property and ensuring that access is granted 
            only to authorized individuals. We use industry-leading security practices and continuously 
            work to improve our platform to meet your needs.
          </p>
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
const auth = useAuthStore()
const isLoggedIn = computed(() => !!auth.user?.value)
</script>

