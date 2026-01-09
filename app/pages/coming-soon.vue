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

      <!-- Newsletter Signup -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <p class="text-white mb-4">Want to be notified when we launch?</p>
        
        <!-- Email Signup Form -->
        <form @submit.prevent="subscribeToNewsletter" class="mb-4">
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
              class="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#8ee0ee] focus:border-transparent"
              :disabled="submitting"
            />
            <button
              type="submit"
              :disabled="submitting || !email"
              class="px-6 py-2 bg-[#8ee0ee] text-[#03045e] font-semibold rounded-lg hover:bg-[#6dd5e0] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Subscribing...' : 'Subscribe' }}
            </button>
          </div>
        </form>

        <!-- Success/Error Messages -->
        <div v-if="message" :class="messageType === 'success' ? 'text-[#8ee0ee]' : 'text-red-300'" class="text-sm mb-3">
          {{ message }}
        </div>

        <!-- Alternative Contact -->
        <p class="text-[#8ee0ee] text-sm">
          Or email us at 
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

const email = ref('')
const submitting = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | null>(null)

const subscribeToNewsletter = async () => {
  if (!email.value || submitting.value) return

  submitting.value = true
  message.value = ''
  messageType.value = null

  try {
    const result = await $fetch<{ success: boolean; message?: string; alreadySubscribed?: boolean }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value }
    })

    if (result.success) {
      message.value = result.message || 'Thank you for subscribing! We\'ll notify you when we launch.'
      messageType.value = 'success'
      email.value = '' // Clear the input on success
    } else {
      message.value = result.message || 'Something went wrong. Please try again.'
      messageType.value = 'error'
    }
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    message.value = error.data?.message || error.message || 'Failed to subscribe. Please try again later.'
    messageType.value = 'error'
  } finally {
    submitting.value = false
  }
}
</script>


