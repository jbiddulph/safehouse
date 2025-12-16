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
                <img src="/images/logo.png" alt="MySafehouse" class="h-full w-full object-cover" />
              </div>
              <NuxtLink to="/" class="text-2xl font-bold text-white">MySafehouse</NuxtLink>
            </div>
            
            <!-- Navigation Menu -->
            <nav class="hidden md:flex items-center space-x-6">
              <NuxtLink to="/about" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                About Us
              </NuxtLink>
              <NuxtLink to="/how-it-works" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                How It Works
              </NuxtLink>
              <NuxtLink to="/privacy-policy" class="text-sm font-medium text-white border-b-2 border-[#8ee0ee] pb-1">
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
    </nav>

    <!-- Main Content -->
    <div class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-4xl font-bold text-[#03045e] mb-6">Privacy Policy</h1>
        
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-600 mb-6">Last updated: January 2025</p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Introduction</h2>
          <p class="text-gray-700 mb-4">
            MySafehouse ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Information We Collect</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Account Information:</strong> Name, email address, phone number, and profile information</li>
            <li><strong>Property Information:</strong> Property addresses, contact details, and access preferences</li>
            <li><strong>Access Logs:</strong> Records of property access requests, approvals, and usage</li>
            <li><strong>Location Data:</strong> Location information for access verification purposes</li>
            <li><strong>Device Information:</strong> Device type, browser information, and IP addresses</li>
          </ul>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">How We Use Your Information</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>To provide and maintain our service</li>
            <li>To process access requests and manage property access</li>
            <li>To send notifications and updates about your account</li>
            <li>To improve our platform and develop new features</li>
            <li>To ensure security and prevent fraud</li>
            <li>To comply with legal obligations</li>
          </ul>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Data Security</h2>
          <p class="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your personal information, including 
            encryption, secure authentication, and regular security audits. However, no method of transmission 
            over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Your Rights</h2>
          <p class="text-gray-700 mb-4">
            You have the right to access, update, or delete your personal information at any time. You can 
            also opt-out of certain communications and request a copy of your data.
          </p>
          
          <h2 class="text-2xl font-semibold text-[#03045e] mt-8 mb-4">Contact Us</h2>
          <p class="text-gray-700 mb-4">
            If you have questions about this Privacy Policy, please contact us through your account settings 
            or by emailing our support team.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-[#03045e] border-t border-[#03045e] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-center">
          <p class="text-sm text-[#8ee0ee]">
            Copyright © 2025 MySafehouse. All rights reserved.
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

