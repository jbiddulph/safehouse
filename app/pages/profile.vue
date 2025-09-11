<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md space-y-4">
      <h1 class="text-2xl font-semibold">Profile</h1>
      <div class="rounded border p-4">
        <p class="text-sm">Signed in as</p>
        <p class="font-medium">{{ profile?.full_name || user?.email }}</p>
        <p class="text-sm text-gray-600">{{ user?.email }}</p>
      </div>
      <UButton color="red" @click="onLogout">Logout</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const auth = useAuthStore()
const user = computed(() => auth.user.value)
const profile = ref(null)


onMounted(async () => {
  if (user.value) {
    profile.value = await auth.getProfile()
  }
})

async function onLogout() {
  try {
    await auth.signOut()
    await navigateTo('/auth/login')
  } catch (err) {
    console.error(err)
  }
}
</script>
