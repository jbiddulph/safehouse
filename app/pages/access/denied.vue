<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
          <Icon name="mdi:cancel" class="h-8 w-8 text-red-600" />
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">Permission Denied</h1>
        <p class="text-sm text-gray-600 mb-6">
          The property owner declined your access request. No property access details are available.
        </p>

        <div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left">
          <p class="text-sm text-red-800">
            If you believe this was a mistake, contact the property owner directly or submit a new request if circumstances change.
          </p>
        </div>

        <NuxtLink
          to="/"
          class="w-full inline-flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#03045e] hover:bg-[#020347]"
        >
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false
})

useSeoMeta({
  title: 'Permission Denied',
  description: 'Your MySafeHouse access request was declined by the property owner.'
})
</script>
