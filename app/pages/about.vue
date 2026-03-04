<template>
  <div class="min-h-screen bg-[#f0f9fb] flex flex-col">
    <!-- Top Navigation -->
    <PublicTopNav :home-to="isLoggedIn ? '/dashboard' : '/'" :is-logged-in="isLoggedIn" />

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
            Copyright © 2026 MySafeHouse. All rights reserved.
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
