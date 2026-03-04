<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  name: 'admin-access-logs-legacy'
})

await navigateTo('/admin/access-logs', { redirectCode: 301 })
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <p class="text-sm text-gray-600">Redirecting to access logs...</p>
  </div>
</template>
