<template>
  <div class="min-h-screen bg-gradient-to-br from-[#03045e] via-[#023e8a] to-[#0077b6] flex items-center justify-center px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- Logo -->
      <div class="mb-8 flex justify-center">
        <div class="h-20 w-20 bg-white rounded-lg flex items-center justify-center shadow-lg">
          <img src="/images/logo.png" alt="MySafeHouse" class="h-full w-full object-cover" />
        </div>
      </div>

      <!-- Main Content -->
      <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
        Coming Soon
      </h1>
      <p class="text-xl md:text-2xl text-[#8ee0ee] mb-8">
        MySafeHouse is launching soon
      </p>
      <p class="text-lg text-white/80 mb-12 max-w-md mx-auto">
        We're working hard to bring you the best property access management solution. 
        Stay tuned for updates!
      </p>

      <!-- Contact Info -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <p class="text-white mb-4">Want to be notified when we launch?</p>
        <p class="text-[#8ee0ee] text-sm">
          Contact us at 
          <a href="mailto:info@mysafehouse.co.uk" class="underline hover:text-white transition-colors">
            info@mysafehouse.co.uk
          </a>
        </p>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-white/60 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} MySafeHouse. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple coming soon page - no auth required
definePageMeta({
  layout: false
})
</script>


