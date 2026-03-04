<template>
  <nav class="bg-[#03045e] shadow-lg border-b border-[#03045e] relative z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-8">
          <div class="flex-shrink-0 flex items-center space-x-3">
            <div class="h-8 w-8 bg-[#ffffff] rounded-lg flex items-center justify-center">
              <img src="/images/logo.png" alt="MySafeHouse" class="h-full w-full object-cover" />
            </div>
            <NuxtLink
              :to="homeTo"
              class="text-xl font-bold text-white no-underline hover:no-underline"
            >
              MySafeHouse
            </NuxtLink>
          </div>

          <nav class="hidden md:flex items-center space-x-6">
            <NuxtLink to="/about" :prefetch="false" :class="navLinkClass('/about')">About Us</NuxtLink>
            <NuxtLink to="/how-it-works" :prefetch="false" :class="navLinkClass('/how-it-works')">How It Works</NuxtLink>
            <NuxtLink to="/privacy-policy" :prefetch="false" :class="navLinkClass('/privacy-policy')">Privacy Policy</NuxtLink>
            <NuxtLink to="/terms" :prefetch="false" :class="navLinkClass('/terms')">Terms & Conditions</NuxtLink>
          </nav>
        </div>

        <div class="hidden md:flex items-center space-x-4">
            <NuxtLink
              v-if="!isLoggedIn"
              to="/auth/login"
              :prefetch="false"
              :class="authLinkClass('/auth/login')"
            >
            Sign In
          </NuxtLink>
            <NuxtLink
              v-if="!isLoggedIn"
              to="/auth/register"
              :prefetch="false"
              :class="authLinkClass('/auth/register')"
            >
            Sign Up
          </NuxtLink>
          <NuxtLink
            v-if="isLoggedIn && showDashboardButton"
            to="/dashboard"
            :prefetch="false"
            class="px-4 py-2 text-sm font-medium text-white bg-[#8ee0ee] rounded-lg hover:bg-[#8ee0ee]/80 transition-colors"
          >
            Dashboard
          </NuxtLink>
        </div>

        <button
          type="button"
          class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#8ee0ee] hover:text-white hover:bg-[#023e8a] transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Toggle navigation menu"
          :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
        >
          <Icon :name="mobileMenuOpen ? 'mdi:close' : 'mdi:menu'" class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden w-full bg-[#03045e] border-t border-[#8ee0ee]/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <nav class="space-y-1">
          <NuxtLink to="/about" :prefetch="false" :class="mobileLinkClass('/about')" @click="mobileMenuOpen = false">About Us</NuxtLink>
          <NuxtLink to="/how-it-works" :prefetch="false" :class="mobileLinkClass('/how-it-works')" @click="mobileMenuOpen = false">How It Works</NuxtLink>
          <NuxtLink to="/privacy-policy" :prefetch="false" :class="mobileLinkClass('/privacy-policy')" @click="mobileMenuOpen = false">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" :prefetch="false" :class="mobileLinkClass('/terms')" @click="mobileMenuOpen = false">Terms & Conditions</NuxtLink>
          <NuxtLink to="/auth/login" :prefetch="false" :class="mobileLinkClass('/auth/login')" @click="mobileMenuOpen = false">Sign In</NuxtLink>
          <NuxtLink to="/auth/register" :prefetch="false" :class="mobileLinkClass('/auth/register')" @click="mobileMenuOpen = false">Sign Up</NuxtLink>
        </nav>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  homeTo?: string
  isLoggedIn?: boolean
  showDashboardButton?: boolean
}>(), {
  homeTo: '/',
  isLoggedIn: false,
  showDashboardButton: true
})

const route = useRoute()
const mobileMenuOpen = ref(false)

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
})

function navLinkClass(path: string) {
  const isActive = route.path === path
  return isActive
    ? 'text-sm font-medium text-white border-b-2 border-[#8ee0ee] pb-1'
    : 'text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors'
}

function authLinkClass(path: string) {
  const isActive = route.path === path
  return isActive
    ? 'text-sm font-medium text-white border-b-2 border-white pb-1 no-underline hover:no-underline'
    : 'text-sm font-medium text-[#8ee0ee] hover:text-white no-underline hover:no-underline transition-colors'
}

function mobileLinkClass(path: string) {
  const isActive = route.path === path
  return isActive
    ? 'block w-full px-2 py-2 text-sm font-medium text-white bg-[#023e8a] rounded'
    : 'block w-full px-2 py-2 text-sm font-medium text-[#8ee0ee] hover:text-white hover:bg-[#023e8a]/60 rounded transition-colors'
}
</script>
