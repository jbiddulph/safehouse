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
              <NuxtLink to="/terms" class="text-sm font-medium text-white border-b-2 border-[#8ee0ee] pb-1">
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
    </nav>

    <!-- Main Content -->
    <div class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-4xl font-bold text-[#03045e] mb-6">Terms & Conditions</h1>
        
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-600 mb-6">Last updated: January 2025</p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Acceptance of Terms</h2>
          <p class="text-gray-700 mb-4">
            By accessing and using SafeHouse, you accept and agree to be bound by the terms and provision 
            of this agreement. If you do not agree to these terms, please do not use our service.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Use License</h2>
          <p class="text-gray-700 mb-4">
            Permission is granted to temporarily use SafeHouse for personal, non-commercial purposes. 
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained in SafeHouse</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">User Responsibilities</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You agree to use the service only for lawful purposes</li>
            <li>You will not share access codes or QR codes with unauthorized individuals</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must provide accurate and complete information when using the service</li>
          </ul>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Property Owner Responsibilities</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Property owners are responsible for managing access to their properties</li>
            <li>Property owners must ensure that access is only granted to authorized individuals</li>
            <li>Property owners are responsible for maintaining accurate property information</li>
            <li>Property owners must respond to access requests in a timely manner</li>
          </ul>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Limitation of Liability</h2>
          <p class="text-gray-700 mb-4">
            SafeHouse shall not be liable for any indirect, incidental, special, consequential, or punitive 
            damages resulting from your use or inability to use the service. We do not guarantee that the 
            service will be available at all times or free from errors.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Termination</h2>
          <p class="text-gray-700 mb-4">
            We reserve the right to terminate or suspend your account and access to the service immediately, 
            without prior notice, for conduct that we believe violates these Terms & Conditions or is 
            harmful to other users, us, or third parties.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Changes to Terms</h2>
          <p class="text-gray-700 mb-4">
            We reserve the right to modify these terms at any time. We will notify users of any material 
            changes. Your continued use of the service after such modifications constitutes acceptance of 
            the updated terms.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Contact Information</h2>
          <p class="text-gray-700 mb-4">
            If you have any questions about these Terms & Conditions, please contact us through your 
            account settings or by emailing our support team.
          </p>
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
const auth = useAuthStore()
const isLoggedIn = computed(() => !!auth.user?.value)
</script>

