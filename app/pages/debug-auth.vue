<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Debug Auth</h1>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Email:</label>
        <input v-model="email" type="email" class="border p-2 rounded w-full" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Password:</label>
        <input v-model="password" type="password" class="border p-2 rounded w-full" />
      </div>
      <button @click="testDirectAuth" class="bg-[#cbeff8]0 text-white px-4 py-2 rounded">
        Test Direct Supabase Auth
      </button>
      <button @click="testStoreAuth" class="bg-[#cbeff8]0 text-white px-4 py-2 rounded">
        Test Store Auth
      </button>
      <div v-if="result" class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="font-bold">Result:</h3>
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-800 rounded">
        <h3 class="font-bold">Error:</h3>
        <p>{{ error }}</p>
        <details class="mt-2">
          <summary>Full Error Details</summary>
          <pre class="mt-2 text-xs">{{ JSON.stringify(error, null, 2) }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const auth = useAuthStore()
const email = ref('test@example.com')
const password = ref('password123')
const result = ref(null)
const error = ref(null)

async function testDirectAuth() {
  try {
    error.value = null
    result.value = null
    const { data, error: authError } = await client.auth.signInWithPassword({ 
      email: email.value, 
      password: password.value 
    })
    
    if (authError) {
      throw authError
    }
    
    result.value = { success: true, data }
  } catch (err) {
    error.value = err
    console.error('Direct auth error:', err)
  }
}

async function testStoreAuth() {
  try {
    error.value = null
    result.value = null
    const data = await auth.signInWithEmail(email.value, password.value)
    result.value = { success: true, data }
  } catch (err) {
    error.value = err
    console.error('Store auth error:', err)
  }
}
</script>
