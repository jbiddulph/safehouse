<template>
  <div class="min-h-screen bg-[#f0f9fb] flex flex-col">
    <!-- Top Navigation -->
    <PublicTopNav :home-to="isLoggedIn ? '/dashboard' : '/'" :is-logged-in="isLoggedIn" />

    <!-- Main Content -->
    <div class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-4xl font-bold text-[#03045e] mb-6">How It Works</h1>
        
        <div class="prose prose-lg max-w-none">
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">For Property Owners</h2>
          <ol class="list-decimal list-inside text-gray-700 space-y-3 mb-6">
            <li><strong>Register Your Property:</strong> Add your property details including address, contact information, and access preferences.</li>
            <li><strong>Set Up Emergency Contacts:</strong> Add trusted contacts who can grant access in emergency situations.</li>
            <li><strong>Generate Access Codes:</strong> Create unique access codes for authorized personnel or emergency situations.</li>
            <li><strong>Share QR Codes:</strong> Generate and share QR codes with authorized individuals for quick access.</li>
            <li><strong>Monitor Access:</strong> View real-time access logs to see who accessed your property and when.</li>
          </ol>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">For Authorized Users</h2>
          <ol class="list-decimal list-inside text-gray-700 space-y-3 mb-6">
            <li><strong>Request Access:</strong> Use the property address search to find and request access to a property.</li>
            <li><strong>Emergency Access:</strong> Request emergency access with location verification for urgent situations.</li>
            <li><strong>Standard Access:</strong> Request standard access for scheduled visits or maintenance.</li>
            <li><strong>Use Access Codes:</strong> Enter the access code provided by the property owner to gain entry.</li>
            <li><strong>Scan QR Codes:</strong> Use the QR code scanner to quickly access properties you're authorized to enter.</li>
          </ol>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Security Features</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Location-based verification ensures access requests come from the property location</li>
            <li>Time-limited access codes that expire after use or a set duration</li>
            <li>Real-time notifications to property owners when access is requested</li>
            <li>Comprehensive access logs for audit and security purposes</li>
            <li>Secure authentication and authorization system</li>
          </ul>
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
