# Pinia State Management Guide

This guide explains how to utilize Pinia stores effectively in the MySafeHouse application.

## Overview

We've created centralized Pinia stores to manage application state, reducing code duplication and improving maintainability.

## Available Stores

### 1. **Auth Store** (`stores/auth.ts`)
Manages user authentication state.

**Usage:**
```typescript
const auth = useAuthStore()

// Access user
const user = auth.user

// Sign in
await auth.signInWithEmail(email, password)

// Sign out
await auth.signOut()

// Get profile (use profile store instead for better caching)
const profile = await auth.getProfile()
```

### 2. **Profile Store** (`stores/profile.ts`)
Manages user profile data with caching and optimistic updates.

**Usage:**
```typescript
const profileStore = useProfileStore()

// Access profile (reactive)
const profile = profileStore.profile
const hasPhone = profileStore.hasPhone
const avatarUrl = profileStore.avatarUrl

// Fetch profile (cached for 5 minutes)
await profileStore.fetchProfile()

// Force refresh
await profileStore.fetchProfile(true)

// Update profile
await profileStore.updateProfile({ full_name: 'New Name' })

// Update avatar
await profileStore.updateAvatar(newAvatarUrl)
```

**Benefits:**
- ✅ Automatic caching (5 minutes)
- ✅ Optimistic updates
- ✅ Auto-fetches when user logs in
- ✅ Clears when user logs out

### 3. **Properties Store** (`stores/properties.ts`)
Manages user properties with selection state.

**Usage:**
```typescript
const propertiesStore = usePropertiesStore()

// Access properties
const properties = propertiesStore.properties
const currentProperty = propertiesStore.currentProperty
const propertyCount = propertiesStore.propertyCount

// Fetch properties (cached for 2 minutes)
await propertiesStore.fetchProperties()

// Create property (optimistic update)
const newProperty = await propertiesStore.createProperty({
  property_name: 'My Home',
  address: '123 Main St',
  // ... other fields
})

// Update property
await propertiesStore.updateProperty(propertyId, { property_name: 'Updated Name' })

// Delete property
await propertiesStore.deleteProperty(propertyId)

// Select property
propertiesStore.selectProperty(propertyId)

// Get property by ID
const property = propertiesStore.getPropertyById(propertyId)
```

**Benefits:**
- ✅ Automatic property selection logic
- ✅ Optimistic updates (UI updates immediately)
- ✅ Caching to reduce API calls
- ✅ Auto-syncs with auth state

### 4. **Contacts Store** (`stores/contacts.ts`)
Manages emergency contacts.

**Usage:**
```typescript
const contactsStore = useContactsStore()

// Access contacts
const contacts = contactsStore.contacts
const primaryContacts = contactsStore.primaryContacts
const emergencyContacts = contactsStore.emergencyContacts

// Fetch contacts
await contactsStore.fetchContacts()

// Create contact
await contactsStore.createContact({
  contact_name: 'John Doe',
  email: 'john@example.com',
  // ... other fields
})

// Update contact
await contactsStore.updateContact(contactId, { contact_name: 'Jane Doe' })

// Delete contact
await contactsStore.deleteContact(contactId)
```

### 5. **Subscription Store** (`stores/subscription.ts`)
Manages subscription and credits information.

**Usage:**
```typescript
const subscriptionStore = useSubscriptionStore()

// Access credits info
const creditsInfo = subscriptionStore.creditsInfo
const canAddProperty = subscriptionStore.canAddProperty
const availableCredits = subscriptionStore.availableCredits

// Fetch credits (cached for 1 minute)
await subscriptionStore.fetchCredits()

// Optimistically update credits (after creating/deleting property)
subscriptionStore.decrementCredits() // After creating property
subscriptionStore.incrementCredits() // After deleting property
```

**Benefits:**
- ✅ Computed `canAddProperty` for easy checks
- ✅ Optimistic credit updates
- ✅ Short cache duration (credits change frequently)

### 6. **Access Requests Store** (`stores/accessRequests.ts`)
Manages pending access requests.

**Usage:**
```typescript
const accessRequestsStore = useAccessRequestsStore()

// Access requests
const pendingRequests = accessRequestsStore.pendingRequests
const pendingCount = accessRequestsStore.pendingCount
const hasPendingRequests = accessRequestsStore.hasPendingRequests

// Fetch pending requests (cached for 30 seconds)
await accessRequestsStore.fetchPendingRequests()

// Remove request after approval/denial
accessRequestsStore.removeRequest(requestId)
```

### 7. **UI Store** (`stores/ui.ts`)
Manages UI state (modals, loading, notifications).

**Usage:**
```typescript
const uiStore = useUIStore()

// Modal management
uiStore.openModal('addProperty')
uiStore.closeModal('addProperty')
uiStore.closeAllModals()

// Loading state
uiStore.setLoading(true, 'Saving...')
uiStore.setLoading(false)

// Notifications
uiStore.notify.success('Property created successfully!')
uiStore.notify.error('Failed to save property')
uiStore.notify.warning('Please check your input')
uiStore.notify.info('Processing...')

// Or use showNotification directly
uiStore.showNotification('success', 'Operation completed', 3000)
```

**Benefits:**
- ✅ Centralized modal state
- ✅ Global loading indicator
- ✅ Toast notification system
- ✅ Easy to add new modals

### 8. **Country Codes Store** (`stores/countryCodes.ts`)
Manages country codes for phone numbers (already implemented).

## Migration Guide

### Before (Dashboard Example):
```typescript
// ❌ Old way - local state
const profile = ref(null)
const properties = ref([])
const contacts = ref([])
const creditsInfo = ref(null)

async function loadProfile() {
  const client = useSupabaseClient()
  const { data } = await client.from('safehouse_profiles')...
  profile.value = data
}

async function loadProperties() {
  const { properties: data } = await $fetch('/api/properties')
  properties.value = data
}
```

### After (Using Stores):
```typescript
// ✅ New way - centralized stores
const profileStore = useProfileStore()
const propertiesStore = usePropertiesStore()
const contactsStore = useContactsStore()
const subscriptionStore = useSubscriptionStore()

// Data is automatically available and cached
const profile = profileStore.profile
const properties = propertiesStore.properties
const contacts = contactsStore.contacts
const creditsInfo = subscriptionStore.creditsInfo

// Fetch only if needed (or use cached data)
onMounted(async () => {
  await Promise.all([
    profileStore.fetchProfile(),
    propertiesStore.fetchProperties(),
    contactsStore.fetchContacts(),
    subscriptionStore.fetchCredits()
  ])
})
```

## Best Practices

### 1. **Use Stores Instead of Local State**
```typescript
// ❌ Don't do this
const properties = ref([])
async function loadProperties() { ... }

// ✅ Do this instead
const propertiesStore = usePropertiesStore()
const properties = propertiesStore.properties
```

### 2. **Leverage Caching**
Stores automatically cache data. Only force refresh when necessary:
```typescript
// Use cached data (default)
await propertiesStore.fetchProperties()

// Force refresh when needed
await propertiesStore.fetchProperties(true)
```

### 3. **Use Computed Properties**
Stores provide computed properties for common checks:
```typescript
// ✅ Use computed
if (subscriptionStore.canAddProperty) { ... }
if (profileStore.hasPhone) { ... }
if (accessRequestsStore.hasPendingRequests) { ... }
```

### 4. **Optimistic Updates**
Stores support optimistic updates for better UX:
```typescript
// Property is added to list immediately
await propertiesStore.createProperty(data)

// Credits are updated immediately
subscriptionStore.decrementCredits()
```

### 5. **Centralized Error Handling**
```typescript
const propertiesStore = usePropertiesStore()

// Check for errors
if (propertiesStore.error) {
  uiStore.notify.error(propertiesStore.error)
}
```

### 6. **Use UI Store for Modals**
```typescript
// ✅ Centralized modal management
const uiStore = useUIStore()

// Open modal
uiStore.openModal('addProperty')

// Close modal
uiStore.closeModal('addProperty')

// In template
<div v-if="uiStore.showAddProperty">...</div>
```

## Advanced Patterns

### 1. **Store Composition**
Stores can use other stores:
```typescript
// In properties store
const auth = useAuthStore()
const subscriptionStore = useSubscriptionStore()

async function createProperty(data) {
  const property = await createPropertyAPI(data)
  // Optimistically update credits
  subscriptionStore.decrementCredits()
  return property
}
```

### 2. **Watchers for Auto-Sync**
Stores automatically watch auth state:
```typescript
// In profile store
watch(() => auth.user.value, (newUser) => {
  if (newUser) {
    fetchProfile()
  } else {
    clearProfile()
  }
})
```

### 3. **Readonly State**
Stores expose readonly state to prevent direct mutations:
```typescript
// State is readonly - use actions to update
const properties = propertiesStore.properties // readonly
propertiesStore.createProperty(data) // use action
```

## Benefits Summary

1. **Reduced Code Duplication** - Data fetching logic in one place
2. **Automatic Caching** - Reduces unnecessary API calls
3. **Optimistic Updates** - Better user experience
4. **Type Safety** - TypeScript interfaces for all data
5. **Centralized State** - Single source of truth
6. **Easy Testing** - Stores can be tested independently
7. **Better Performance** - Shared state across components
8. **Automatic Cleanup** - State clears on logout

## Next Steps

1. **Migrate Dashboard** - Replace local state with stores
2. **Migrate Profile Page** - Use profile store
3. **Add Notifications Component** - Use UI store notifications
4. **Add Loading Overlay** - Use UI store global loading
5. **Implement Real-time Updates** - Use store actions for WebSocket updates

## Example: Complete Dashboard Migration

```typescript
// Before: 200+ lines of state management
const profile = ref(null)
const properties = ref([])
// ... many more refs

// After: Clean and simple
const profileStore = useProfileStore()
const propertiesStore = usePropertiesStore()
const subscriptionStore = useSubscriptionStore()
const uiStore = useUIStore()

// All data is reactive and cached
const profile = profileStore.profile
const properties = propertiesStore.properties
const canAddProperty = subscriptionStore.canAddProperty
```

This reduces complexity and makes the codebase more maintainable!

