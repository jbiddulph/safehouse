<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Visible Notification Test</h1>
        
        <!-- Status -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Status</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span>Permission:</span>
              <span :class="permissionClass" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ notificationPermission }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>Supported:</span>
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
              @click="testVisibleNotification" 
              :disabled="notificationPermission !== 'granted'"
              class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-bold"
            >
              🚨 TEST VISIBLE NOTIFICATION 🚨
            </button>
            
            <button 
              @click="testPersistentNotification" 
              :disabled="notificationPermission !== 'granted'"
              class="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Persistent Notification (Stays until clicked)
            </button>
            
            <button 
              @click="testMultipleNotifications" 
              :disabled="notificationPermission !== 'granted'"
              class="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Multiple Notifications
            </button>
          </div>
        </div>

        <!-- Instructions -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 class="text-sm font-medium text-yellow-800 mb-2">If you don't see notifications:</h3>
          <ul class="text-xs text-yellow-700 space-y-1">
            <li>• Check your Mac notification settings</li>
            <li>• Look for the notification center icon in your menu bar</li>
            <li>• Make sure Do Not Disturb is off</li>
            <li>• Check browser notification settings</li>
            <li>• Try a different browser</li>
          </ul>
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
    case 'granted': return 'bg-[#f0f9fb] text-[#03045e]'
    case 'denied': return 'bg-red-100 text-red-800'
    default: return 'bg-yellow-100 text-yellow-800'
  }
})

const supportedClass = computed(() => {
  return notificationsSupported.value ? 'bg-[#f0f9fb] text-[#03045e]' : 'bg-red-100 text-red-800'
})

function testVisibleNotification() {
  try {
    const notification = new Notification('🚨 VISIBLE TEST NOTIFICATION 🚨', {
      body: 'This notification should be VERY visible! Look at your screen!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'visible-test',
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200] // Vibration pattern if supported
    })
    
    notification.onclick = () => {
      addTestResult(true, '🚨 VISIBLE notification clicked!')
      notification.close()
    }
    
    // Auafter 30 seconds
    setTimeout(() => {
      if (notification) {
        notification.close()
        addTestResult(true, '🚨 VISIBLE notification auafter 30 seconds')
      }
    }, 30000)
    
    addTestResult(true, '🚨 VISIBLE notification sent - look at your screen!')
  } catch (error) {
    addTestResult(false, `🚨 VISIBLE notification failed: ${error.message}`)
  }
}

function testPersistentNotification() {
  try {
    const notification = new Notification('Persistent Test', {
      body: 'This notification will stay until you click it',
      icon: '/favicon.ico',
      tag: 'persistent-test',
      requireInteraction: true,
      silent: false
    })
    
    notification.onclick = () => {
      addTestResult(true, 'Persistent notification clicked!')
      notification.close()
    }
    
    addTestResult(true, 'Persistent notification sent (stays until clicked)')
  } catch (error) {
    addTestResult(false, `Persistent notification failed: ${error.message}`)
  }
}

function testMultipleNotifications() {
  try {
    for (let i = 1; i <= 3; i++) {
      setTimeout(() => {
        const notification = new Notification(`Test Notification ${i}`, {
          body: `This is notification number ${i} of 3`,
          icon: '/favicon.ico',
          tag: `multiple-test-${i}`,
          requireInteraction: false,
          silent: false
        })
        
        notification.onclick = () => {
          addTestResult(true, `Multiple notification ${i} clicked!`)
          notification.close()
        }
        
        addTestResult(true, `Multiple notification ${i} sent`)
      }, i * 1000) // Send one every second
    }
  } catch (error) {
    addTestResult(false, `Multiple notifications failed: ${error.message}`)
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
