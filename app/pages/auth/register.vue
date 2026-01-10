<template>
  <div class="min-h-screen bg-[#f0f9fb] flex flex-col">
    <!-- Top Navigation -->
    <nav class="bg-[#03045e] shadow-lg border-b border-[#03045e]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Title -->
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0 flex items-center space-x-3">
              <div class="h-8 w-8 bg-[#ffffff] rounded-lg flex items-center justify-center">
                <img src="/images/logo.png" alt="MySafeHouse" class="h-full w-full object-cover" />
              </div>
              <NuxtLink to="/" class="text-xl font-bold text-white">MySafeHouse</NuxtLink>
            </div>
            
            <!-- Navigation Menu -->
            <nav class="hidden md:flex items-center space-x-6">
              <NuxtLink to="/about" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                About Us
              </NuxtLink>
              <NuxtLink to="/how-it-works" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                How It Works
              </NuxtLink>
              <NuxtLink to="/privacy-policy" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                Privacy Policy
              </NuxtLink>
              <NuxtLink to="/terms" class="text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
                Terms & Conditions
              </NuxtLink>
            </nav>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/auth/login" 
              class="text-sm font-medium text-[#8ee0ee] hover:text-white no-underline hover:no-underline transition-colors"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/auth/register" 
              class="text-sm font-medium text-white border-b-2 border-white pb-1 no-underline hover:no-underline hover:border-white hover:text-white"
            >
              Sign Up
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full mx-auto space-y-8">
        <!-- Header Text -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-[#03045e] mb-2">Create your account</h2>
          <p class="text-lg text-gray-600">
            Join MySafeHouse to manage your properties and access requests
          </p>
        </div>

        <!-- Registration Form -->
        <div class="bg-white py-8 px-6 shadow-xl rounded-lg">
        <form class="space-y-6" @submit.prevent="onSubmit">
          <!-- Avatar Upload Section -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Profile Picture</label>
            <div class="flex items-center space-x-4">
              <div v-if="avatarPreview" class="w-20 h-20 rounded-full overflow-hidden border-4 border-[#8ee0ee] shadow-lg">
                <img :src="avatarPreview" alt="Avatar preview" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-[#f0f9fb] flex items-center justify-center border-4 border-[#8ee0ee]">
                <svg class="w-10 h-10 text-[#8ee0ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="space-y-2">
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  @change="onAvatarChange"
                  class="hidden"
                />
                <UButton @click="$refs.avatarInput.click()" size="sm" variant="outline" class="w-full">
                  {{ avatarFile ? 'Change Photo' : 'Upload Photo' }}
                </UButton>
                <UButton v-if="avatarFile" @click="removeAvatar" size="sm" color="red" variant="ghost" class="w-full">
                  Remove
                </UButton>
              </div>
            </div>
          </div>

          <!-- Payment Plan Selection -->
          <div v-if="selectedPlan" class="bg-[#f0f9fb] p-4 rounded-lg border border-[#8ee0ee]">
            <label class="block text-sm font-medium text-gray-700 mb-2">Selected Payment Plan</label>
            <select
              v-model="selectedPlan"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
            >
              <option v-for="option in planOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            
            <!-- Additional Credits (only for premium plan) -->
            <div v-if="selectedPlan === 'premium'" class="mt-4">
              <label for="additionalCredits" class="block text-sm font-medium text-gray-700 mb-2">
                Additional Credits (Optional)
              </label>
              <UInput
                id="additionalCredits"
                v-model.number="additionalCredits"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                class="w-full"
              />
              <p class="text-xs text-gray-500 mt-1">£12 per additional credit per year</p>
            </div>

            <!-- Payment Summary -->
            <div class="mt-4 pt-4 border-t border-[#8ee0ee]">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Base Plan:</span>
                <span class="text-sm font-semibold text-[#03045e]">£24/year</span>
              </div>
              <div v-if="selectedPlan === 'premium' && additionalCredits > 0" class="flex justify-between items-center mt-2">
                <span class="text-sm font-medium text-gray-700">Additional Credits ({{ additionalCredits }}):</span>
                <span class="text-sm font-semibold text-[#03045e]">£{{ additionalCredits * 12 }}/year</span>
              </div>
              <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                <span class="text-base font-bold text-[#03045e]">Total:</span>
                <span class="text-lg font-bold text-[#03045e]">£{{ totalPrice }}/year</span>
              </div>
            </div>
          </div>
          <div v-else class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p class="text-sm text-yellow-800">
              Please <NuxtLink to="/payments" class="font-medium text-[#03045e] underline">select a payment plan</NuxtLink> first.
            </p>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <UInput 
                id="fullName"
                v-model="fullName" 
                type="text" 
                placeholder="Enter your full name" 
                required 
                class="w-full"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <UInput 
                id="email"
                v-model="email" 
                type="email" 
                placeholder="Enter your email" 
                required 
                class="w-full"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
              <div class="flex gap-2">
                <div class="w-32">
                  <select
                    id="countryCode"
                    v-model="selectedCountryCode"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8ee0ee] focus:border-[#8ee0ee]"
                    @change="onCountryCodeChange"
                  >
                    <option v-for="country in countryCodes" :key="country.code" :value="country.code">
                      {{ country.flag }} {{ country.code }}
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <UInput 
                    id="phone"
                    v-model="phoneNumber" 
                    type="tel" 
                    :placeholder="phonePlaceholder" 
                    required 
                    class="w-full"
                    @input="formatPhoneNumber"
                  />
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ phoneFormatHint }}
              </p>
              <p v-if="phoneError" class="mt-1 text-xs text-red-600">{{ phoneError }}</p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <UInput 
                id="password"
                v-model="password" 
                type="password" 
                placeholder="Create a secure password" 
                required 
                class="w-full"
                @input="validatePasswordMatch"
              />
            </div>

            <div>
              <label for="passwordConfirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <UInput 
                id="passwordConfirmation"
                v-model="passwordConfirmation" 
                type="password" 
                placeholder="Confirm your password" 
                required 
                class="w-full"
                @input="validatePasswordMatch"
              />
              <p v-if="passwordMatchError" class="mt-1 text-xs text-red-600">{{ passwordMatchError }}</p>
            </div>
          </div>


          <!-- Submit Button -->
          <div class="pt-4">
            <UButton 
              type="submit" 
              :loading="loading" 
              block 
              size="lg"
              class="w-full bg-[#03045e] hover:bg-[#03045e] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </UButton>
          </div>

          <!-- Login Link -->
          <div class="text-center pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">
              Already have an account? 
              <NuxtLink to="/auth/login" class="font-medium text-[#8ee0ee] hover:text-[#8ee0ee]0 transition-colors">
                Sign in here
              </NuxtLink>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-[#03045e] border-t border-[#03045e] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-center">
          <p class="text-sm text-[#8ee0ee]">
            Copyright © 2025 MySafeHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)
const auth = useAuthStore()
const phoneError = ref('')
const passwordMatchError = ref('')

// Use country codes store
const countryCodesStore = useCountryCodesStore()
const countryCodes = countryCodesStore.countryCodes

const selectedCountryCode = ref('+44')
const phoneNumber = ref('')
const currentCountry = computed(() => countryCodesStore.getCountryByCode(selectedCountryCode.value) || countryCodes[0])
const phonePlaceholder = computed(() => {
  const country = currentCountry.value
  return country ? `${selectedCountryCode.value}${country.example}` : '+447987654321'
})
const phoneFormatHint = computed(() => {
  const country = currentCountry.value
  return country ? `Format: ${country.code} followed by your number (e.g., ${country.code}${country.example})` : 'Format: +44 followed by your number (e.g., +447987654321)'
})

// Payment plan state
const selectedPlan = ref<string | null>(null)
const additionalCredits = ref(0)

// Avatar upload state
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

// Plan options
const planOptions = [
  { label: 'Basic Plan - £24/year (1 property)', value: 'basic' },
  { label: 'Premium Plan - £24/year + £12 per additional credit', value: 'premium' }
]

// Computed total price
const totalPrice = computed(() => {
  const basePrice = 24
  if (selectedPlan.value === 'premium') {
    return basePrice + (additionalCredits.value * 12)
  }
  return basePrice
})

definePageMeta({ middleware: ['guest-only'] })

// Parse existing phone number if it has a country code
function parseExistingPhone(phoneValue: string) {
  if (!phoneValue) return
  
  const parsed = countryCodesStore.parsePhoneNumber(phoneValue)
  if (parsed) {
    selectedCountryCode.value = parsed.countryCode
    phoneNumber.value = parsed.number
    phone.value = phoneValue
  } else {
    // If no match found, default to UK and use the whole value
    phone.value = phoneValue
  }
}

// Get plan from query params
onMounted(() => {
  const planParam = route.query.plan as string
  if (planParam === 'basic' || planParam === 'premium') {
    selectedPlan.value = planParam
  } else {
    // Redirect to payments page if no plan selected
    navigateTo('/payments')
  }
  
  // Parse phone if it exists (shouldn't happen on registration, but just in case)
  if (phone.value) {
    parseExistingPhone(phone.value)
  }
})


function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }
    
    avatarFile.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeAvatar() {
  avatarFile.value = null
  avatarPreview.value = null
  // Reset file input
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
}

// Handle country code change
function onCountryCodeChange() {
  phoneNumber.value = ''
  phoneError.value = ''
  // If phone already has a value, try to extract the number part
  if (phone.value) {
    const parsed = countryCodesStore.parsePhoneNumber(phone.value)
    if (parsed) {
      selectedCountryCode.value = parsed.countryCode
      phoneNumber.value = parsed.number
    }
  }
}

// Format phone number as user types
function formatPhoneNumber(event: Event) {
  phoneError.value = ''
  const input = event.target as HTMLInputElement
  let value = input.value.trim()
  
  // Remove all non-digit characters
  value = value.replace(/\D/g, '')
  
  // Remove leading 0 if present (common in UK numbers)
  if (value.startsWith('0')) {
    value = value.substring(1)
  }
  
  phoneNumber.value = value
  
  // Combine country code + number for validation
  const fullPhone = selectedCountryCode.value + value
  const country = currentCountry.value
  
  // Validate format based on country pattern
  if (value && value.length > 0 && country) {
    if (!country.pattern.test(fullPhone)) {
      phoneError.value = `Phone number must be in format ${country.code} followed by your number (e.g., ${country.code}${country.example})`
    } else {
      phoneError.value = ''
    }
  }
  
  // Update the full phone value for submission
  phone.value = fullPhone
}

// Validate password match
function validatePasswordMatch() {
  passwordMatchError.value = ''
  
  if (passwordConfirmation.value && password.value !== passwordConfirmation.value) {
    passwordMatchError.value = 'Passwords do not match'
  } else if (passwordConfirmation.value && password.value === passwordConfirmation.value) {
    passwordMatchError.value = ''
  }
}

async function onSubmit() {
  if (!selectedPlan.value) {
    alert('Please select a payment plan first.')
    return
  }

  // Combine country code + phone number
  const fullPhone = selectedCountryCode.value + phoneNumber.value.trim()
  phone.value = fullPhone

  // Validate phone number format
  if (!phoneNumber.value || !phoneNumber.value.trim()) {
    phoneError.value = 'Phone number is required'
    return
  }
  
  const country = currentCountry.value
  if (!country || !country.pattern.test(fullPhone)) {
    phoneError.value = country ? `Phone number must be in format ${country.code} followed by your number (e.g., ${country.code}${country.example})` : 'Invalid phone number format'
    return
  }

  // Validate password match
  if (!password.value || !passwordConfirmation.value) {
    passwordMatchError.value = 'Both password fields are required'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    passwordMatchError.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    const result = await auth.signUpWithEmail(
      email.value, 
      password.value, 
      fullName.value, 
      phone.value, 
      avatarFile.value,
      selectedPlan.value,
      additionalCredits.value
    )
    if (result.user) {
      // Check if user needs email confirmation
      if (result.user.email_confirmed_at) {
        // User is already confirmed, redirect to Stripe checkout
        await navigateToStripeCheckout(result.user.id)
      } else {
        // User needs email confirmation - store subscription info in session/localStorage
        if (process.client) {
          localStorage.setItem('pending_subscription', JSON.stringify({
            plan: selectedPlan.value,
            additionalCredits: additionalCredits.value,
            userId: result.user.id
          }))
        }
        alert('Registration successful! Please check your email and click the confirmation link. You will be redirected to payment after confirming your email.')
        await navigateTo('/auth/login')
      }
    }
  } catch (err: any) {
    console.error('Registration error:', err)
    if (err.message?.includes('User already registered')) {
      alert('This email is already registered. Please try logging in instead.')
    } else {
      alert('Registration failed: ' + (err.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}

async function navigateToStripeCheckout(userId: string) {
  try {
    const response = await $fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: {
        userId,
        subscriptionType: selectedPlan.value,
        additionalCredits: additionalCredits.value || 0,
        totalAmount: totalPrice.value
      }
    })
    
    if (response.checkoutUrl) {
      window.location.href = response.checkoutUrl
    } else {
      throw new Error('Failed to create checkout session')
    }
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    alert('Failed to redirect to payment page. Please try again or contact support.')
  }
}
</script>
