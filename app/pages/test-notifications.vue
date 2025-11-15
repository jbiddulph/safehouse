<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Notification Test Page</h1>
        
        <!-- Permission Status -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Permission Status</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span>Current Permission:</span>
              <span :class="permissionClass" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ notificationPermission }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>Notifications Supported:</span>
              <span :class="supportedClass" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ notificationsSupported ? 'Yes' : 'No' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Test Buttons -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Test Notifications</h2>
          <div class="space-y-3">
            <button 
              @click="requestPermission" 
              :disabled="notificationPermission === 'granted'"
              class="w-full bg-[#03045e] text-white px-4 py-2 rounded-md hover:bg-[#03045e] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ notificationPermission === 'granted' ? 'Permission Already Granted' : 'Request Notification Permission' }}
            </button>
            
            <button 
              @click="testBasicNotification" 
              :disabled="notificationPermission !== 'granted'"
              class="w-full bg-[#03045e] text-white px-4 py-2 rounded-md hover:bg-[#03045e] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Basic Notification
            </button>
            
            <button 
              @click="testRichNotification" 
              :disabled="notificationPermission !== 'granted'"
              class="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Rich Notification
            </button>
            
            <button 
              @click="testPersistentNotification" 
              :disabled="notificationPermission !== 'granted'"
              class="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Persistent Notification
            </button>
          </div>
        </div>

        <!-- Test Results -->
        <div v-if="testResults.length > 0" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Test Results</h2>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="(result, index) in testResults" :key="index" class="text-sm border-b pb-2">
              <div class="flex items-center justify-between">
                <span :class="result.success ? 'text-[#8ee0ee]' : 'text-red-600'" class="font-medium">
                  {{ result.success ? '✅' : '❌' }}
                </span>
                <span class="text-xs text-gray-500">{{ result.timestamp }}</span>
              </div>
              <div class="ml-6">{{ result.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const notificationPermission = ref('default')
const notificationsSupported = ref(false)
const testResults = ref([])

onMounted(() => {
  checkNotificationSupport()
  checkPermission()
})

function checkNotificationSupport() {
  notificationsSupported.value = typeof Notification !== 'undefined'
  addTestResult(notificationsSupported.value, `Notifications supported: ${notificationsSupported.value}`)
}

function checkPermission() {
  if (notificationsSupported.value) {
    notificationPermission.value = Notification.permission
    addTestResult(true, `Current permission: ${notificationPermission.value}`)
  }
}

const permissionClass = computed(() => {
  switch (notificationPermission.value) {
    case 'granted': return 'bg-[#cbeff8] text-[#03045e]'
    case 'denied': return 'bg-red-100 text-red-800'
    default: return 'bg-yellow-100 text-yellow-800'
  }
})

const supportedClass = computed(() => {
  return notificationsSupported.value ? 'bg-[#cbeff8] text-[#03045e]' : 'bg-red-100 text-red-800'
})

async function requestPermission() {
  try {
    if (!notificationsSupported.value) {
      addTestResult(false, 'Notifications not supported in this browser')
      return
    }

    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    
    if (permission === 'granted') {
      addTestResult(true, 'Notification permission granted successfully')
    } else {
      addTestResult(false, `Notification permission ${permission}`)
    }
  } catch (error) {
    addTestResult(false, `Permission request failed: ${error.message}`)
  }
}

function testBasicNotification() {
  try {
    const notification = new Notification('Basic Test', {
      body: 'This is a basic notification test',
      icon: '/favicon.ico'
    })
    
    notification.onclick = () => {
      addTestResult(true, 'Basic notification clicked')
      notification.close()
    }
    
    addTestResult(true, 'Basic notification sent')
  } catch (error) {
    addTestResult(false, `Basic notification failed: ${error.message}`)
  }
}

function testRichNotification() {
  try {
    const notification = new Notification('Rich Test', {
      body: 'This is a rich notification with more details',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'rich-test',
      requireInteraction: true,
      data: { test: 'rich' }
    })
    
    notification.onclick = () => {
      addTestResult(true, 'Rich notification clicked')
      notification.close()
    }
    
    addTestResult(true, 'Rich notification sent')
  } catch (error) {
    addTestResult(false, `Rich notification failed: ${error.message}`)
  }
}

function testPersistentNotification() {
  try {
    const notification = new Notification('Persistent Test', {
      body: 'This notification should stay until you click it',
      icon: '/favicon.ico',
      tag: 'persistent-test',
      requireInteraction: true,
      silent: false
    })
    
    notification.onclick = () => {
      addTestResult(true, 'Persistent notification clicked')
      notification.close()
    }
    
    // Auafter 10 seconds for testing
    setTimeout(() => {
      if (notification) {
        notification.close()
        addTestResult(true, 'Persistent notification auafter 10 seconds')
      }
    }, 10000)
    
    addTestResult(true, 'Persistent notification sent (will auin 10 seconds)')
  } catch (error) {
    addTestResult(false, `Persistent notification failed: ${error.message}`)
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
