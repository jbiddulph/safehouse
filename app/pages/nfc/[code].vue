<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-6">
    <div class="text-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#03045e] mx-auto mb-4"></div>
      <p class="text-gray-600">Redirecting to property...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const rawCode = route.params.code
const code = Array.isArray(rawCode) ? rawCode[0] : rawCode

if (!code) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing NFC code'
  })
}

const { data, error } = await useFetch(`/api/nfc/${encodeURIComponent(code)}`, {
  server: true
})

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: error.value.statusMessage || 'NFC code not found'
  })
}

const propertyId = data.value?.propertyId as string | undefined
if (!propertyId) {
  throw createError({
    statusCode: 404,
    statusMessage: 'No property assigned to this NFC code'
  })
}

await navigateTo(`/property/${propertyId}`, { redirectCode: 302 })
</script>
