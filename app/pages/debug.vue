<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Debug: Check Users</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="users.length === 0">No users found</div>
    <div v-else>
      <div v-for="user in users" :key="user.id" class="border p-4 mb-2">
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Confirmed:</strong> {{ user.email_confirmed_at ? 'Yes' : 'No' }}</p>
        <p><strong>Created:</strong> {{ user.created_at }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true)
const users = ref([])

onMounted(async () => {
  try {
    // This is a server-side check - in production you'd want to protect this
    const { data } = await $fetch('/api/debug/users')
    users.value = data
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
})
</script>
