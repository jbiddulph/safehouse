<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Auth Test</h1>
    <div class="space-y-4">
      <button @click="testLogin" class="bg-[#cbeff8]0 text-white px-4 py-2 rounded">
        Test Login
      </button>
      <button @click="testSignup" class="bg-[#cbeff8]0 text-white px-4 py-2 rounded">
        Test Signup
      </button>
      <div v-if="result" class="mt-4 p-4 bg-gray-100 rounded">
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-800 rounded">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
const auth = useAuthStore()
const result = ref(null)
const error = ref(null)

async function testLogin() {
  try {
    error.value = null
    result.value = await auth.signInWithEmail('test@example.com', 'password123')
  } catch (err) {
    error.value = err.message
    console.error('Login test error:', err)
  }
}

async function testSignup() {
  try {
    error.value = null
    result.value = await auth.signUpWithEmail('test@example.com', 'password123', 'Test User')
  } catch (err) {
    error.value = err.message
    console.error('Signup test error:', err)
  }
}
</script>
