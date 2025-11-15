<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">FCM Test Page</h1>
        
        <!-- FCM Status -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">FCM Status</h2>
          <div class="space-y-2">
            <div class="flex items-center">
              <div :class="fcmStatus.initialized ? 'bg-[#cbeff8] text-[#03045e]' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ fcmStatus.initialized ? 'Initialized' : 'Not Initialized' }}
              </div>
            </div>
            <div class="flex items-center">
              <div :class="fcmStatus.permission ? 'bg-[#cbeff8] text-[#03045e]' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ fcmStatus.permission ? 'Permission Granted' : 'Permission Denied' }}
              </div>
            </div>
            <div class="flex items-center">
              <div :class="fcmStatus.token ? 'bg-[#cbeff8] text-[#03045e]' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ fcmStatus.token ? 'Token Generated' : 'No Token' }}
              </div>
            </div>
          </div>
        </div>

        <!-- FCM Token Display -->
        <div v-if="fcmStatus.token" class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">FCM Token</h2>
          <div class="bg-gray-50 p-3 rounded-md">
            <p class="text-xs text-gray-500 mb-1">Token:</p>
            <p class="text-sm font-mono text-gray-800 break-all">{{ fcmStatus.token }}</p>
          </div>
        </div>

        <!-- Test Buttons -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Test Actions</h2>
          <div class="space-y-3">
            <button 
              @click="requestPermission" 
              :disabled="fcmStatus.permission"
              class="w-full bg-[#03045e] text-white px-4 py-2 rounded-md hover:bg-[#03045e] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ fcmStatus.permission ? 'Permission Already Granted' : 'Request Notification Permission' }}
            </button>
            
            <button 
              @click="registerFCMToken" 
              :disabled="!fcmStatus.token || fcmStatus.registered"
              class="w-full bg-[#03045e] text-white px-4 py-2 rounded-md hover:bg-[#03045e] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ fcmStatus.registered ? 'Token Registered' : 'Register FCM Token' }}
            </button>
            
            <button 
              @click="testNotification" 
              :disabled="!fcmStatus.permission"
              class="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Local Notification
            </button>
          </div>
        </div>

        <!-- Test Results -->
        <div v-if="testResults.length > 0" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Test Results</h2>
          <div class="space-y-2">
            <div v-for="(result, index) in testResults" :key="index" class="text-sm">
              <span :class="result.success ? 'text-[#8ee0ee]' : 'text-red-600'" class="font-medium">
                {{ result.success ? '✅' : '❌' }}
              </span>
              <span class="ml-2">{{ result.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const fcmStatus = ref({
  initialized: false,
  permission: false,
  token: null,
  registered: false
})

const testResults = ref([])

// Check if Firebase is available
onMounted(() => {
  checkFCMStatus()
})

function checkFCMStatus() {
  // Check if Firebase is initialized
  if (typeof window !== 'undefined' && window.firebase) {
    fcmStatus.value.initialized = true
  }

  // Check notification permission
  if (typeof Notification !== 'undefined') {
    fcmStatus.value.permission = Notification.permission === 'granted'
  }

  // Check if we have a stored FCM token
  const storedToken = localStorage.getItem('fcm_token')
  if (storedToken) {
    fcmStatus.value.token = storedToken
    fcmStatus.value.registered = true
  }
}

async function requestPermission() {
  try {
    if (typeof Notification === 'undefined') {
      addTestResult(false, 'Notifications not supported in this browser')
      return
    }

    const permission = await Notification.requestPermission()
    fcmStatus.value.permission = permission === 'granted'
    
    if (permission === 'granted') {
      addTestResult(true, 'Notification permission granted')
      // Try to get FCM token
      await getFCMToken()
    } else {
      addTestResult(false, 'Notification permission denied')
    }
  } catch (error) {
    addTestResult(false, `Permission request failed: ${error.message}`)
  }
}

async function getFCMToken() {
  try {
    // For testing, we'll simulate FCM token generation
    const mockToken = 'test-fcm-token-' + Date.now()
    fcmStatus.value.token = mockToken
    localStorage.setItem('fcm_token', mockToken)
    addTestResult(true, 'Mock FCM token generated (Firebase not configured)')
  } catch (error) {
    addTestResult(false, `FCM token generation failed: ${error.message}`)
  }
}

async function registerFCMToken() {
  try {
    const response = await $fetch('/api/fcm/register', {
      method: 'POST',
      body: {
        fcm_token: fcmStatus.value.token,
        user_type: 'owner'
      }
    })

    if (response.success) {
      fcmStatus.value.registered = true
      addTestResult(true, 'FCM token registered successfully')
    } else {
      addTestResult(false, 'FCM token registration failed')
    }
  } catch (error) {
    addTestResult(false, `FCM registration error: ${error.message}`)
  }
}

function testNotification() {
  try {
    if (typeof Notification === 'undefined') {
      addTestResult(false, 'Notifications not supported')
      return
    }

    const notification = new Notification('FCM Test', {
      body: 'This is a test notification from SafeHouse FCM',
      icon: '/favicon.ico',
      tag: 'fcm-test'
    })

    notification.onclick = () => {
      addTestResult(true, 'Notification clicked successfully')
      notification.close()
    }

    addTestResult(true, 'Test notification sent')
  } catch (error) {
    addTestResult(false, `Notification test failed: ${error.message}`)
  }
}

function addTestResult(success, message) {
  testResults.value.unshift({
    success,
    message,
    timestamp: new Date().toLocaleTimeString()
  })
}
</script>
