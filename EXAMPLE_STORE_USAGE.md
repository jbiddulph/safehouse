# Example: Using Pinia Stores in Dashboard

Here's how to refactor the dashboard to use the new Pinia stores:

## Before (Current Implementation)

```typescript
// ❌ Lots of local state
const profile = ref(null)
const properties = ref([])
const contacts = ref([])
const creditsInfo = ref(null)
const pendingAccessRequests = ref([])
const selectedPropertyId = ref(null)

// ❌ Multiple load functions
async function loadProfile() { ... }
async function loadProperties() { ... }
async function loadContacts() { ... }
async function loadCredits() { ... }
async function loadPendingAccessRequests() { ... }

// ❌ Manual state management
onMounted(async () => {
  await loadProfile()
  await loadProperties()
  await loadContacts()
  await loadCredits()
  await loadPendingAccessRequests()
})
```

## After (Using Stores)

```typescript
// ✅ Clean store usage
const profileStore = useProfileStore()
const propertiesStore = usePropertiesStore()
const contactsStore = useContactsStore()
const subscriptionStore = useSubscriptionStore()
const accessRequestsStore = useAccessRequestsStore()
const uiStore = useUIStore()

// ✅ All data is reactive and cached
const profile = profileStore.profile
const properties = propertiesStore.properties
const contacts = contactsStore.contacts
const creditsInfo = subscriptionStore.creditsInfo
const pendingRequests = accessRequestsStore.pendingRequests

// ✅ Computed properties available
const canAddProperty = subscriptionStore.canAddProperty
const currentProperty = propertiesStore.currentProperty
const hasPendingRequests = accessRequestsStore.hasPendingRequests

// ✅ Simple initialization
onMounted(async () => {
  // Stores auto-fetch if not cached
  await Promise.all([
    profileStore.fetchProfile(),
    propertiesStore.fetchProperties(),
    contactsStore.fetchContacts(),
    subscriptionStore.fetchCredits(),
    accessRequestsStore.fetchPendingRequests()
  ])
})

// ✅ Creating a property
async function createProperty(data) {
  try {
    const property = await propertiesStore.createProperty(data)
    subscriptionStore.decrementCredits() // Optimistic update
    uiStore.notify.success('Property created successfully!')
    uiStore.closeModal('addProperty')
  } catch (error) {
    uiStore.notify.error('Failed to create property')
  }
}

// ✅ Template usage
// <div v-if="profileStore.hasPhone">...</div>
// <div v-if="subscriptionStore.canAddProperty">...</div>
// <div v-if="accessRequestsStore.hasPendingRequests">...</div>
```

## Key Improvements

1. **Less Code** - No need for local refs and load functions
2. **Automatic Caching** - Data is cached and shared across components
3. **Optimistic Updates** - UI updates immediately
4. **Type Safety** - Full TypeScript support
5. **Reactive** - All data is automatically reactive
6. **Auto-cleanup** - State clears on logout automatically

