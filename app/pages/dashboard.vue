<template>
  <div class="min-h-screen bg-[#f0f9fb]">
    <!-- Top Navigation -->
    <nav class="bg-[#03045e] shadow-lg border-b border-[#03045e]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Title -->
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0 flex items-center space-x-3">
              <div class="h-8 w-8 bg-[#ffffff] rounded-lg flex items-center justify-center">
                <!-- <svg class="h-5 w-5 text-[#03045e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg> -->
                <img src="/images/logo.png" alt="SafeHouse" class="h-full w-full object-cover" />
              </div>
              <h1 class="text-2xl font-bold text-white">SafeHouse</h1>
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
              
              <!-- Notification Bell (Admin Only) -->
              <button v-if="profile?.role === 'admin'" class="relative p-2 text-[#8ee0ee] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ee0ee] rounded-full hover:bg-[#03045e]/50">
                <Icon name="mdi:bell" class="h-6 w-6" />
                <!-- Notification Badge -->
                <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              <!-- Profile Dropdown -->
              <div class="relative">
                <button @click="showProfileMenu = !showProfileMenu" class="flex items-center space-x-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ee0ee] hover:bg-[#03045e]/50 px-3 py-2 transition-colors duration-200">
                  <div v-if="profile?.avatar_url" class="h-8 w-8 rounded-full overflow-hidden border-2 border-[#8ee0ee] shadow-sm">
                    <img :src="avatarUrl" alt="Profile" class="h-full w-full object-cover" />
                  </div>
                  <div v-else class="h-8 w-8 rounded-full bg-[#f0f9fb] flex items-center justify-center border-2 border-[#8ee0ee] shadow-sm">
                    <Icon name="mdi:account" class="h-5 w-5 text-[#03045e]" />
                  </div>
                  <span class="text-sm font-medium text-white">{{ profile?.full_name || auth.user?.value?.email || 'User' }}</span>
                  <Icon name="mdi:chevron-down" class="h-4 w-4 text-[#8ee0ee]" />
                </button>

                <!-- Dropdown Menu -->
                <div v-if="showProfileMenu" @click.away="showProfileMenu = false" class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div class="px-4 py-2 border-b border-gray-100">
                    <div class="text-sm font-medium text-gray-900">{{ profile?.full_name || 'User' }}</div>
                    <div class="text-xs text-gray-500">{{ auth.user?.value?.email }}</div>
                  </div>
                  <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <div class="flex items-center">
                      <Icon name="mdi:account" class="h-4 w-4 mr-2" />
                      Profile Settings
                    </div>
                  </NuxtLink>
                  <NuxtLink to="/access-requests" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <div class="flex items-center">
                      <Icon name="mdi:file-document" class="h-4 w-4 mr-2" />
                      Access Requests
                    </div>
                  </NuxtLink>
                  <button @click="onLogout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <div class="flex items-center">
                      <Icon name="mdi:logout" class="h-4 w-4 mr-2" />
                      Sign out
                    </div>
                  </button>
                </div>
              </div>
            </nav>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden">
            <button @click="showMobileMenu = !showMobileMenu" class="text-[#8ee0ee] hover:text-white focus:outline-none">
              <Icon :name="showMobileMenu ? 'mdi:close' : 'mdi:menu'" class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden bg-[#03045e] border-t border-[#03045e]">
        <div class="px-4 py-4 space-y-3">
          <NuxtLink to="/about" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            About Us
          </NuxtLink>
          <NuxtLink to="/how-it-works" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            How It Works
          </NuxtLink>
          <NuxtLink to="/privacy-policy" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            Privacy Policy
          </NuxtLink>
          <NuxtLink to="/terms" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            Terms & Conditions
          </NuxtLink>
          
          <!-- Notification Bell (Admin Only) -->
          <button v-if="profile?.role === 'admin'" class="block w-full text-left px-4 py-2 text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
            <div class="flex items-center">
              <Icon name="mdi:bell" class="h-5 w-5 mr-2" />
              Notifications
            </div>
          </button>
          
          <!-- Profile Links in Mobile Menu -->
          <NuxtLink to="/profile" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            Profile Settings
          </NuxtLink>
          <NuxtLink to="/access-requests" class="block text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors" @click="showMobileMenu = false">
            Access Requests
          </NuxtLink>
          <button @click="() => { onLogout(); showMobileMenu = false; }" class="block w-full text-left text-sm font-medium text-[#8ee0ee] hover:text-white transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              Welcome back, {{ profile?.full_name || 'User' }}!
            </h2>
            <p class="mt-2 text-lg text-gray-600">
              Manage your properties and emergency contacts
            </p>
          </div>
          <div class="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button @click="showAddProperty = true" class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-[#03045e] hover:bg-[#03045e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ee0ee] transition-all duration-200 transform hover:scale-105">
              <Icon name="mdi:plus" class="-ml-1 mr-2 h-5 w-5" />
              Add Property
            </button>
            <button @click="showAddContact = true" class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ee0ee] transition-all duration-200 transform hover:scale-105">
              <Icon name="mdi:account-plus" class="-ml-1 mr-2 h-5 w-5" />
              Add Contact
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="px-4 py-4 sm:px-0 mb-8">
        <div class="flex flex-wrap gap-4">
          <NuxtLink 
            v-if="profile?.role === 'admin'"
            to="/domains" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ee0ee] transition-colors duration-200"
          >
            <Icon name="mdi:web" class="-ml-1 mr-2 h-4 w-4" />
            Domain Management
          </NuxtLink>
          <NuxtLink 
            v-if="profile?.role === 'admin'"
            to="/profile" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ee0ee] transition-colors duration-200"
          >
            <Icon name="mdi:account" class="-ml-1 mr-2 h-4 w-4" />
            Profile Settings
          </NuxtLink>
          <NuxtLink 
            v-if="profile?.role === 'admin'"
            to="/admin" 
            class="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <Icon name="mdi:shield-account" class="-ml-1 mr-2 h-4 w-4" />
            Admin Panel
          </NuxtLink>
        </div>
      </div>

      <!-- Properties and Contacts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Properties Section -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Your Properties</h3>
            <div v-if="properties.length === 0" class="text-center py-6">
              <Icon name="mdi:home" class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No properties</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by adding your first property.</p>
              <div class="mt-6">
                <button @click="showAddProperty = true" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#03045e] hover:bg-[#03045e]">
                  <Icon name="mdi:plus" class="-ml-1 mr-2 h-5 w-5" />
                  Add Property
                </button>
              </div>
            </div>
            <div v-else class="space-y-4">
                    <div v-for="property in properties" :key="property.id" class="border rounded-lg p-4 hover:bg-gray-50">
                      <div class="flex items-start gap-4 mb-3">
                        <!-- Small Map -->
                        <div v-if="hasValidCoordinates(property)" class="flex-shrink-0">
                          <img 
                            :src="getPropertyMapUrl(property.longitude, property.latitude)"
                            :alt="`Map of ${property.property_name}`"
                            class="w-32 h-24 rounded border border-gray-200 object-cover bg-gray-100 cursor-pointer"
                            @error="handleMapImageError"
                            @click.stop="viewPropertyDetails(property)"
                            loading="lazy"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-start justify-between gap-2 mb-1">
                            <h4 class="text-sm font-medium text-gray-900 cursor-pointer" @click.stop="viewPropertyDetails(property)">{{ property.property_name }}</h4>
                            <span v-if="property.emergency_access_enabled" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f0f9fb] text-[#03045e] flex-shrink-0">
                              Active
                            </span>
                          </div>
                          <p class="text-sm text-gray-500 cursor-pointer" @click.stop="viewPropertyDetails(property)">{{ property.address }}, {{ property.city }}</p>
                          <p class="text-xs text-gray-400">QR: {{ property.qr_code }}</p>
                          
                          <!-- Contact Status -->
                          <div class="mt-2 flex items-center space-x-2">
                            <div class="flex items-center space-x-1">
                              <Icon name="mdi:account-group" class="h-4 w-4 text-gray-400" />
                              <span v-if="property.safehouse_property_contacts && property.safehouse_property_contacts[0] && property.safehouse_property_contacts[0].count > 0" class="text-xs text-[#8ee0ee] font-medium">
                                {{ property.safehouse_property_contacts[0].count }} contact{{ property.safehouse_property_contacts[0].count !== 1 ? 's' : '' }} assigned
                              </span>
                              <span v-else class="text-xs text-red-500 font-medium">
                                No contacts assigned
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Action Buttons Row -->
                      <div class="flex items-center gap-2 pt-3 border-t border-gray-200">
                        <button @click.stop="editProperty(property)" class="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-[#03045e] rounded hover:bg-[#03045e] transition-colors">
                          Edit
                        </button>
                        <span class="text-gray-300">|</span>
                        <button @click.stop="deleteProperty(property.id)" class="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-[#03045e] rounded hover:bg-[#03045e] transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
            </div>
          </div>
        </div>

        <!-- Contacts Section -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Emergency Contacts</h3>
              <button @click="showAddContact = true" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#03045e] hover:bg-[#03045e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8ee0ee]">
                <Icon name="mdi:plus" class="-ml-0.5 mr-2 h-4 w-4" />
                Add Contact
              </button>
            </div>
            <div v-if="contacts.length === 0" class="text-center py-6">
              <Icon name="mdi:account-group" class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No contacts yet</h3>
              <p class="mt-1 text-sm text-gray-500">Add emergency contacts for property access.</p>
              <div class="mt-6">
                <button @click="showAddContact = true" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#03045e] hover:bg-[#03045e]">
                  <Icon name="mdi:plus" class="-ml-1 mr-2 h-5 w-5" />
                  Add Your First Contact
                </button>
              </div>
            </div>
            <div v-else class="space-y-4">
              <div v-for="contact in contacts" :key="contact.id" class="border rounded-lg p-4 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">{{ contact.contact_name }}</h4>
                        <p class="text-sm text-gray-500">{{ contact.email }}</p>
                        <p class="text-xs text-gray-400">{{ contact.relationship }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 mt-2">
                      <span v-if="contact.is_primary" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0f9fb] text-[#03045e]">
                        Primary
                      </span>
                      <span v-if="contact.is_tenant" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0f9fb] text-[#03045e]">
                        Tenant
                      </span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ contact.emergency_access_level }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button @click="editContact(contact)" class="text-[#8ee0ee] hover:text-[#03045e] text-sm font-medium">
                      Edit
                    </button>
                    <button @click="deleteContact(contact.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        <div class="bg-white overflow-hidden shadow-xl rounded-xl border border-[#8ee0ee] hover:shadow-2xl transition-shadow duration-300">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 bg-[#03045e] rounded-lg flex items-center justify-center">
                  <Icon name="mdi:home" class="h-6 w-6 text-[#8ee0ee]" />
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Properties</dt>
                  <dd class="text-2xl font-bold text-gray-900">{{ properties.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-xl rounded-xl border border-[#8ee0ee] hover:shadow-2xl transition-shadow duration-300">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 bg-[#03045e] rounded-lg flex items-center justify-center">
                  <Icon name="mdi:account-group" class="h-6 w-6 text-[#8ee0ee]" />
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Emergency Contacts</dt>
                  <dd class="text-2xl font-bold text-gray-900">{{ contacts.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-xl rounded-xl border border-[#8ee0ee] hover:shadow-2xl transition-shadow duration-300">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 bg-[#03045e] rounded-lg flex items-center justify-center">
                  <Icon name="mdi:account-multiple" class="h-6 w-6 text-[#8ee0ee]" />
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Properties with Contacts</dt>
                  <dd class="text-2xl font-bold text-gray-900">{{ propertiesWithContacts }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Property Modal -->
    <div v-if="showAddProperty" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Add New Property</h3>
            <button @click="showAddProperty = false" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" class="h-6 w-6" />
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Form Section -->
            <form @submit.prevent="createProperty" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Property Name</label>
              <input v-model="newProperty.property_name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
            </div>
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <input 
                v-model="addressQuery" 
                @input="fetchAddressSuggestions"
                @focus="handleAddressInputFocus"
                @blur="hideAddressSuggestions"
                type="text" 
                required 
                placeholder="Start typing an address..."
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              >
              
              <!-- Address Suggestions -->
              <div 
                v-if="showAddressSuggestions && addressSuggestions.length > 0" 
                class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <div
                  v-for="(suggestion, index) in addressSuggestions"
                  :key="index"
                  :class="[
                    'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0',
                    selectedAddressIndex === index ? 'bg-[#f0f9fb] text-[#03045e]' : 'hover:bg-gray-50'
                  ]"
                  @click="selectAddressSuggestion(suggestion)"
                  @mouseenter="selectedAddressIndex = index"
                >
                  <div class="font-medium">{{ suggestion.formatted_address }}</div>
                  <div v-if="suggestion.postcode" class="text-sm text-gray-500">
                    {{ suggestion.postcode }}
                    <span v-if="suggestion.city"> • {{ suggestion.city }}</span>
                  </div>
                </div>
              </div>
              
              <!-- No results message -->
              <div 
                v-if="showAddressSuggestions && addressSuggestions.length === 0 && addressQuery.length > 2 && !loadingAddressSuggestions"
                class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500"
              >
                No addresses found. Try a different search term.
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">City</label>
                <input v-model="newProperty.city" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">State</label>
                <input v-model="newProperty.state" type="text" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Postal Code</label>
              <input v-model="newProperty.postal_code" type="text" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
            </div>
            <!-- Country is hidden, defaults to GB (United Kingdom) -->
            <input type="hidden" v-model="newProperty.country">
            <div>
              <label class="block text-sm font-medium text-gray-700">Property Type</label>
              <select v-model="newProperty.property_type" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="vacation">Vacation</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button @click="showAddProperty = false" type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" :disabled="creatingProperty" class="px-4 py-2 text-sm font-medium text-white bg-[#03045e] rounded-md hover:bg-[#03045e] disabled:opacity-50">
                {{ creatingProperty ? 'Creating...' : 'Create Property' }}
              </button>
            </div>
          </form>
          
          <!-- Map Section -->
          <div class="lg:sticky lg:top-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Location on Map</label>
            <p class="text-xs text-gray-500 mb-2">Click on the map to set the property location</p>
            <div 
              ref="propertyMapContainer" 
              class="w-full h-96 rounded-lg border border-gray-300 overflow-hidden relative"
              style="min-height: 384px; width: 100%; position: relative;"
            >
              <div v-if="reverseGeocoding" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03045e] mx-auto mb-2"></div>
                  <p class="text-sm text-gray-600">Getting address...</p>
                </div>
              </div>
            </div>
            <p v-if="mapMarker" class="mt-2 text-xs text-gray-600">
              Location set: {{ mapMarker.lat.toFixed(6) }}, {{ mapMarker.lng.toFixed(6) }}
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Contact Modal -->
    <div v-if="showEditContact" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Edit Contact</h3>
            <button @click="showEditContact = false" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" class="h-6 w-6" />
            </button>
          </div>
          <form @submit.prevent="updateContact" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Contact Name</label>
              <input v-model="editingContact.contact_name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="editingContact.email" type="email" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Phone (Optional)</label>
              <input v-model="editingContact.phone" type="tel" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Relationship</label>
              <select v-model="editingContact.relationship" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Select relationship</option>
                <option value="next_of_kin">Next of Kin</option>
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="neighbor">Neighbor</option>
                <option value="tenant">Tenant</option>
                <option value="property_manager">Property Manager</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <!-- Property Link -->
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Link contact with property <span class="text-red-500">*</span></label>
                <select v-model="editingContact.tenant_property_id" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select property</option>
                  <option v-for="property in properties" :key="property.id" :value="property.id">
                    {{ property.property_name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Emergency Access Level</label>
                <select v-model="editingContact.emergency_access_level" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="standard">Standard</option>
                  <option value="limited">Limited</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
            
            <div class="flex items-center">
              <input v-model="editingContact.is_primary" type="checkbox" class="h-4 w-4 text-[#8ee0ee] border-gray-300 rounded">
              <label class="ml-2 block text-sm text-gray-700">Primary emergency contact</label>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button @click="showEditContact = false" type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" :disabled="updatingContact" class="px-4 py-2 text-sm font-medium text-white bg-[#03045e] rounded-md hover:bg-[#03045e] disabled:opacity-50">
                {{ updatingContact ? 'Updating...' : 'Update Contact' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Contact Modal -->
    <div v-if="showAddContact" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Add Contact</h3>
            <button @click="showAddContact = false" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" class="h-6 w-6" />
            </button>
          </div>
          <form @submit.prevent="createContact" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Contact Name</label>
              <input v-model="newContact.contact_name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="newContact.email" type="email" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Phone (Optional)</label>
              <input v-model="newContact.phone" type="tel" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Relationship</label>
              <select v-model="newContact.relationship" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Select relationship</option>
                <option value="next_of_kin">Next of Kin</option>
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="neighbor">Neighbor</option>
                <option value="tenant">Tenant</option>
                <option value="property_manager">Property Manager</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <!-- Property Link -->
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Link contact with property <span class="text-red-500">*</span></label>
                <select v-model="newContact.tenant_property_id" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select property</option>
                  <option v-for="property in properties" :key="property.id" :value="property.id">
                    {{ property.property_name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Emergency Access Level</label>
                <select v-model="newContact.emergency_access_level" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="standard">Standard</option>
                  <option value="limited">Limited</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
            
            <div class="flex items-center">
              <input v-model="newContact.is_primary" type="checkbox" class="h-4 w-4 text-[#8ee0ee] border-gray-300 rounded">
              <label class="ml-2 block text-sm text-gray-700">Primary emergency contact</label>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button @click="showAddContact = false" type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" :disabled="creatingContact" class="px-4 py-2 text-sm font-medium text-white bg-[#03045e] rounded-md hover:bg-[#03045e] disabled:opacity-50">
                {{ creatingContact ? 'Creating...' : 'Create Contact' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Property Details Modal -->
    <div v-if="showPropertyDetails" class="fixed inset-0 bg-black overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">{{ selectedProperty?.property_name }} - Contacts</h3>
            <button @click="showPropertyDetails = false" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" class="h-6 w-6" />
            </button>
          </div>
          
          <!-- Property Info -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Address</p>
                <p class="text-sm text-gray-900">{{ selectedProperty?.address }}, {{ selectedProperty?.city }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">QR Code</p>
                <p class="text-sm text-gray-900 font-mono">{{ selectedProperty?.qr_code }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">NFC ID</p>
                <p class="text-sm text-gray-900 font-mono">{{ selectedProperty?.nfc_id }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Status</p>
                <span v-if="selectedProperty?.emergency_access_enabled" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0f9fb] text-[#03045e]">
                  Emergency Access Enabled
                </span>
              </div>
            </div>
          </div>

          <!-- Property Map -->
          <div v-if="selectedProperty && hasValidCoordinates(selectedProperty)" class="mb-6">
            <h4 class="text-md font-medium text-gray-900 mb-3">Property Location</h4>
            <div 
              ref="propertyDetailsMapContainer" 
              class="w-full h-64 rounded-lg overflow-hidden border border-gray-300"
              style="min-height: 256px; position: relative;"
            ></div>
          </div>

          <!-- Property Contacts List -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-3">Property Contacts ({{ propertyContacts.length }})</h4>
            <div v-if="propertyContacts.length === 0" class="text-center py-6 text-gray-500">
              No contacts assigned to this property yet.
            </div>
            <div v-else class="space-y-3">
              <div v-for="pc in propertyContacts" :key="pc.id" class="border rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="text-sm font-medium text-gray-900">{{ pc.contact.contact_name }}</h5>
                    <p class="text-sm text-gray-500">{{ pc.contact.email }}</p>
                    <div class="flex space-x-2 mt-1">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f0f9fb] text-[#03045e]">
                        {{ pc.relationship_type.replace('_', ' ').toUpperCase() }}
                      </span>
                      <span v-if="pc.can_grant_access" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f0f9fb] text-[#03045e]">
                        Can Grant Access
                      </span>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Priority {{ pc.notification_priority }}
                      </span>
                    </div>
                  </div>
                  <button @click="removeContactFromProperty(pc.id)" class="text-red-600 hover:text-red-800 text-sm">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRModal" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">QR Code for {{ selectedQRProperty?.property_name }}</h3>
            <button @click="showQRModal = false" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" class="h-6 w-6" />
            </button>
          </div>
          
          <div v-if="qrCodeLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#03045e]"></div>
            <p class="mt-2 text-sm text-gray-500">Generating QR code...</p>
          </div>
          
          <div v-else-if="qrCodeData" class="text-center">
            <div class="mb-4">
              <img :src="qrCodeData.qr_data_url" alt="QR Code" class="mx-auto border rounded-lg" />
            </div>
            <div class="text-sm text-gray-600 mb-4">
              <p class="font-medium">{{ selectedQRProperty?.property_name }}</p>
              <p class="text-gray-500">{{ selectedQRProperty?.address }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-md">
              <p class="text-xs text-gray-500 mb-1">QR Code Value:</p>
              <p class="text-sm font-mono text-gray-800 break-all">{{ qrCodeData.qr_code }}</p>
            </div>
            <div class="mt-4 text-xs text-gray-500">
              <p class="mb-2">Scan this QR code to request emergency access to this property.</p>
              <p class="text-gray-400">When scanned, users will be prompted to enter their email address and access code.</p>
            </div>
            <div class="mt-4 flex space-x-2">
              <button 
                @click="downloadQRCode" 
                class="flex-1 bg-[#03045e] text-white px-3 py-2 rounded-md text-sm hover:bg-[#03045e]"
              >
                Download QR Code
              </button>
              <button 
                @click="copyQRUrl" 
                class="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700"
              >
                Copy URL
              </button>
            </div>
          </div>
          
          <div v-else class="text-center py-8">
            <p class="text-sm text-red-600">Failed to generate QR code</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Property Modal -->
    <div v-if="showEditProperty" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Edit Property</h3>
            <button @click="showEditProperty = false" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" class="h-6 w-6" />
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Form Section -->
            <form @submit.prevent="updateProperty" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Property Name</label>
              <input v-model="editingProperty.property_name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
            </div>
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <input 
                v-model="editAddressQuery" 
                @input="fetchEditAddressSuggestions"
                @focus="handleEditAddressInputFocus"
                @blur="hideEditAddressSuggestions"
                type="text" 
                required 
                placeholder="Start typing an address..."
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              >
              
              <!-- Address Suggestions -->
              <div 
                v-if="showEditAddressSuggestions && editAddressSuggestions.length > 0" 
                class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <div
                  v-for="(suggestion, index) in editAddressSuggestions"
                  :key="index"
                  :class="[
                    'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0',
                    selectedEditAddressIndex === index ? 'bg-[#f0f9fb] text-[#03045e]' : 'hover:bg-gray-50'
                  ]"
                  @click="selectEditAddressSuggestion(suggestion)"
                  @mouseenter="selectedEditAddressIndex = index"
                >
                  <div class="font-medium">{{ suggestion.formatted_address }}</div>
                  <div v-if="suggestion.postcode" class="text-sm text-gray-500">
                    {{ suggestion.postcode }}
                    <span v-if="suggestion.city"> • {{ suggestion.city }}</span>
                  </div>
                </div>
              </div>
              
              <!-- No results message -->
              <div 
                v-if="showEditAddressSuggestions && editAddressSuggestions.length === 0 && editAddressQuery.length > 2 && !loadingEditAddressSuggestions"
                class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500"
              >
                No addresses found. Try a different search term.
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">City</label>
                <input v-model="editingProperty.city" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">State</label>
                <input v-model="editingProperty.state" type="text" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Postal Code</label>
              <input v-model="editingProperty.postal_code" type="text" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
            </div>
            <!-- Country is hidden, defaults to GB (United Kingdom) -->
            <input type="hidden" v-model="editingProperty.country">
            <div>
              <label class="block text-sm font-medium text-gray-700">Property Type</label>
              <select v-model="editingProperty.property_type" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="vacation">Vacation</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button @click="showEditProperty = false" type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" :disabled="updatingProperty" class="px-4 py-2 text-sm font-medium text-white bg-[#03045e] rounded-md hover:bg-[#03045e] disabled:opacity-50">
                {{ updatingProperty ? 'Updating...' : 'Update Property' }}
              </button>
            </div>
          </form>
          
          <!-- Map Section -->
          <div class="lg:sticky lg:top-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Location on Map</label>
            <p class="text-xs text-gray-500 mb-2">Click on the map to set the property location</p>
            <div 
              ref="editPropertyMapContainer" 
              class="w-full h-96 rounded-lg border border-gray-300 overflow-hidden relative"
              style="min-height: 384px; width: 100%; position: relative;"
            >
              <div v-if="editReverseGeocoding" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03045e] mx-auto mb-2"></div>
                  <p class="text-sm text-gray-600">Getting address...</p>
                </div>
              </div>
            </div>
            <p v-if="editMapMarker" class="mt-2 text-xs text-gray-600">
              Location set: {{ editMapMarker.lat.toFixed(6) }}, {{ editMapMarker.lng.toFixed(6) }}
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-[#03045e] border-t border-[#03045e] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-center">
          <p class="text-sm text-[#8ee0ee]">
            Copyright © 2025 SafeHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const auth = useAuthStore()
const profile = ref(null)
const properties = ref([])
const contacts = ref([])
const showProfileMenu = ref(false)
const showMobileMenu = ref(false)
const showAddProperty = ref(false)

// Watch for modal opening to initialize map
watch(showAddProperty, (isOpen) => {
  if (isOpen) {
    // Wait for modal to be fully rendered before initializing map
    nextTick(() => {
      setTimeout(() => {
        initPropertyMap()
      }, 200)
    })
  } else {
    // Clean up map when modal closes
    if (propertyMap.value) {
      try {
        propertyMap.value.remove()
      } catch (e) {
        // Map might already be removed
      }
      propertyMap.value = null
    }
    if (propertyMapMarker.value) {
      try {
        propertyMapMarker.value.remove()
      } catch (e) {
        // Marker might already be removed
      }
      propertyMapMarker.value = null
    }
  }
})

const showAddContact = ref(false)
const showEditContact = ref(false)
const showEditProperty = ref(false)
const showPropertyDetails = ref(false)
const showQRModal = ref(false)
const qrCodeLoading = ref(false)
const qrCodeData = ref(null)
const selectedQRProperty = ref(null)
const selectedProperty = ref(null)
const propertyContacts = ref([])

// Watch for edit property modal opening to initialize map
watch(showEditProperty, (isOpen) => {
  if (isOpen && editingProperty.value.id) {
    // Wait for modal to be fully rendered before initializing map
    nextTick(() => {
      setTimeout(() => {
        initEditPropertyMap()
      }, 200)
    })
  } else {
    // Clean up map when modal closes
    if (editPropertyMap.value) {
      try {
        editPropertyMap.value.remove()
      } catch (e) {
        // Map might already be removed
      }
      editPropertyMap.value = null
    }
    if (editPropertyMapMarker.value) {
      try {
        editPropertyMapMarker.value.remove()
      } catch (e) {
        // Marker might already be removed
      }
      editPropertyMapMarker.value = null
    }
  }
})

// Watch for property details modal opening to initialize map
watch(showPropertyDetails, (isOpen) => {
  if (isOpen && selectedProperty.value) {
    // Wait for modal to be fully rendered before initializing map
    nextTick(() => {
      setTimeout(() => {
        initPropertyDetailsMap()
      }, 400) // Increased delay to ensure modal is fully visible
    })
  } else {
    // Clean up map when modal closes
    if (propertyDetailsMap.value) {
      try {
        propertyDetailsMap.value.remove()
      } catch (e) {
        // Map might already be removed
      }
      propertyDetailsMap.value = null
    }
    if (propertyDetailsMapMarker.value) {
      try {
        propertyDetailsMapMarker.value.remove()
      } catch (e) {
        // Marker might already be removed
      }
      propertyDetailsMapMarker.value = null
    }
  }
})

const creatingProperty = ref(false)
const updatingProperty = ref(false)
const creatingContact = ref(false)
const updatingContact = ref(false)
const addingContactToProperty = ref(false)

// Form data
const newProperty = ref({
  property_name: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'GB', // Default to UK
  property_type: 'residential',
  latitude: null as number | null,
  longitude: null as number | null
})

// Address autocomplete for property form
const addressQuery = ref('')
const addressSuggestions = ref([])
const showAddressSuggestions = ref(false)
const loadingAddressSuggestions = ref(false)
const selectedAddressIndex = ref(-1)
const selectedAddress = ref(null)

// Mapbox for property form
const propertyMapContainer = ref<HTMLElement | null>(null)
const propertyMap = ref<any>(null)
const propertyMapMarker = ref<any>(null)
const mapMarker = ref<{ lat: number; lng: number } | null>(null)
const reverseGeocoding = ref(false)

// Mapbox for property details modal
const propertyDetailsMapContainer = ref<HTMLElement | null>(null)
const propertyDetailsMap = ref<any>(null)
const propertyDetailsMapMarker = ref<any>(null)

// Edit property form data
const editingProperty = ref({
  id: '',
  property_name: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'GB',
  property_type: 'residential',
  latitude: null as number | null,
  longitude: null as number | null
})

// Address autocomplete for edit property form
const editAddressQuery = ref('')
const editAddressSuggestions = ref([])
const showEditAddressSuggestions = ref(false)
const loadingEditAddressSuggestions = ref(false)
const selectedEditAddressIndex = ref(-1)
const selectedEditAddress = ref(null)

// Mapbox for edit property form
const editPropertyMapContainer = ref<HTMLElement | null>(null)
const editPropertyMap = ref<any>(null)
const editPropertyMapMarker = ref<any>(null)
const editMapMarker = ref<{ lat: number; lng: number } | null>(null)
const editReverseGeocoding = ref(false)

const newContact = ref({
  contact_name: '',
  email: '',
  phone: '',
  relationship: '',
  is_primary: false,
  is_tenant: false,
  tenant_property_id: '',
  emergency_access_level: 'standard'
})

const editingContact = ref({
  id: '',
  contact_name: '',
  email: '',
  phone: '',
  relationship: '',
  is_primary: false,
  is_tenant: false,
  tenant_property_id: '',
  emergency_access_level: 'standard'
})

// Property contact management
const selectedContactId = ref('')
const newPropertyContact = ref({
  relationship_type: 'emergency_contact',
  can_grant_access: false,
  notification_priority: 1
})

// Computed property to get the default relationship type for a selected contact
const defaultRelationshipType = computed(() => {
  if (!selectedContactId.value) return 'emergency_contact'
  
  const contact = contacts.value.find(c => c.id === selectedContactId.value)
  if (!contact) return 'emergency_contact'
  
  // Map contact's primary relationship to property relationship type
  const relationshipMap = {
    'next_of_kin': 'emergency_contact',
    'family': 'emergency_contact',
    'friend': 'emergency_contact',
    'colleague': 'emergency_contact',
    'neighbor': 'neighbor',
    'tenant': 'tenant',
    'property_manager': 'property_manager',
    'maintenance': 'maintenance',
    'other': 'emergency_contact'
  }
  
  return relationshipMap[contact.relationship] || 'emergency_contact'
})

// Computed property for available contacts (not already assigned to this property)
const availableContacts = computed(() => {
  if (!selectedProperty.value) return contacts.value
  const assignedContactIds = propertyContacts.value.map(pc => pc.contact_id)
  return contacts.value.filter(contact => !assignedContactIds.includes(contact.id))
})

// Computed property for avatar URL with timestamp
const avatarUrl = computed(() => {
  if (!profile.value?.avatar_url) return null
  
  if (profile.value.avatar_url.includes('?t=')) {
    return profile.value.avatar_url
  }
  
  const timestamp = new Date().getTime()
  return `${profile.value.avatar_url}?t=${timestamp}`
})

// Computed property for properties with contacts
const propertiesWithContacts = computed(() => {
  return properties.value.filter(property => 
    property.safehouse_property_contacts && 
    property.safehouse_property_contacts[0] && 
    property.safehouse_property_contacts[0].count > 0
  ).length
})

// Watch for user changes and reload profile
watch(() => auth.user?.value, async (newUser) => {
  if (newUser) {
    await loadProfile()
  } else {
    profile.value = null
  }
}, { immediate: true })

// Watch for selected contact changes and update relationship type
watch(selectedContactId, (newContactId) => {
  if (newContactId) {
    newPropertyContact.value.relationship_type = defaultRelationshipType.value
  }
})

onMounted(async () => {
  // Load profile first
  await loadProfile()
  
  // Load properties and contacts
  await loadProperties()
  await loadContacts()
})

async function loadProfile() {
  try {
    // Check session directly first
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()

    if (!session) {
      await navigateTo('/auth/login')
      return
    }

    // If user is available in reactive state, use it
    if (auth.user?.value) {
      profile.value = await auth.getProfile()
    } else {
      // Use session user directly to fetch profile
      try {
        const { data, error } = await client
          .from('safehouse_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Profile fetch error:', error)
          profile.value = null
        } else {
          profile.value = data
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        profile.value = null
      }
    }
  } catch (error) {
    console.error('Profile loading error:', error)
    profile.value = null
  }
}

async function loadProperties() {
  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    const userId = session?.user?.id
    const { properties: data } = await $fetch('/api/properties', {
      query: userId ? { userId } : undefined
    })
    properties.value = data || []
  } catch (error) {
    console.error('Failed to load properties:', error)
    properties.value = []
  }
}

async function loadContacts() {
  try {
    const client = useSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    const userId = session?.user?.id
    const { contacts: data } = await $fetch('/api/contacts', {
      query: userId ? { userId } : undefined
    })
    contacts.value = data || []
  } catch (error) {
    console.error('Failed to load contacts:', error)
    contacts.value = []
  }
}

// Mapbox functions
function initPropertyMap() {
  if (!propertyMapContainer.value) return
  
  // Ensure we're on client side
  if (typeof window === 'undefined') return
  
  // Clean up existing map if any
  if (propertyMap.value) {
    try {
      propertyMap.value.remove()
    } catch (e) {
      // Map might already be removed
    }
    propertyMap.value = null
  }
  if (propertyMapMarker.value) {
    try {
      propertyMapMarker.value.remove()
    } catch (e) {
      // Marker might already be removed
    }
    propertyMapMarker.value = null
  }
  
  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    if (!propertyMapContainer.value) return
    
    // Check if container is visible and has dimensions (critical for mobile)
    const checkContainer = () => {
      if (!propertyMapContainer.value) return false
      
      const rect = propertyMapContainer.value.getBoundingClientRect()
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       rect.top < window.innerHeight && 
                       rect.bottom > 0
      
      return isVisible
    }
    
    // If container is not ready, wait a bit more (especially important for mobile modals)
    if (!checkContainer()) {
      // Try multiple times with increasing delays for mobile
      const tryInitialize = (attempt: number = 0) => {
        if (attempt > 5) {
          console.warn('Map container not ready after multiple attempts')
          return
        }
        
        setTimeout(() => {
          if (!propertyMapContainer.value) return
          
          if (checkContainer()) {
            initializeMap()
          } else {
            tryInitialize(attempt + 1)
          }
        }, attempt === 0 ? 100 : attempt * 200)
      }
      
      tryInitialize()
      return
    }
    
    initializeMap()
  })
}

function initializeMap() {
  if (!propertyMapContainer.value) return
  
  // Ensure container is visible and has dimensions (critical for mobile)
  const container = propertyMapContainer.value
  if (container instanceof HTMLElement) {
    // Force visibility and dimensions
    container.style.display = 'block'
    container.style.visibility = 'visible'
    container.style.position = 'relative'
    
    // Wait for next frame to ensure styles are applied
    requestAnimationFrame(() => {
      if (!propertyMapContainer.value) return
      
      const { initMap, addMarker, reverseGeocode } = useMapbox()
      
      // Initialize map centered on UK
      propertyMap.value = initMap(propertyMapContainer.value, {
        center: [-2.2374, 53.4808], // Manchester, UK
        zoom: 6,
        onMapClick: async (lng: number, lat: number) => {
          await handleMapClick(lng, lat)
        }
      })
      
      // Force resize multiple times to ensure mobile rendering
      if (propertyMap.value) {
        // Immediate resize after initialization
        requestAnimationFrame(() => {
          if (propertyMap.value) {
            propertyMap.value.resize()
          }
        })
        
        // Resize after a short delay
        setTimeout(() => {
          if (propertyMap.value) {
            propertyMap.value.resize()
          }
        }, 100)
        
        // Resize after a longer delay (for mobile modals)
        setTimeout(() => {
          if (propertyMap.value) {
            propertyMap.value.resize()
          }
        }, 500)
        
        // Resize on map load event
        propertyMap.value.on('load', () => {
          requestAnimationFrame(() => {
            if (propertyMap.value) {
              propertyMap.value.resize()
            }
          })
        })
      }
    })
  }
}

async function handleMapClick(lng: number, lat: number) {
  if (!propertyMap.value) return
  
  reverseGeocoding.value = true
  
  try {
    const { addMarker, reverseGeocode } = useMapbox()
    
    // Remove existing marker
    if (propertyMapMarker.value) {
      propertyMapMarker.value.remove()
    }
    
    // Add new marker
    propertyMapMarker.value = addMarker(propertyMap.value, lng, lat, {
      draggable: true,
      onDragEnd: async (newLng: number, newLat: number) => {
        await handleMapClick(newLng, newLat)
      }
    })
    
    mapMarker.value = { lat, lng }
    
    // Reverse geocode to get address
    try {
      const addressData = await reverseGeocode(lng, lat)
      
      if (addressData) {
        // Populate form fields
        newProperty.value.address = addressData.address || addressData.formatted_address || ''
        newProperty.value.city = addressData.city || ''
        newProperty.value.state = addressData.state || ''
        newProperty.value.postal_code = addressData.postcode || ''
        newProperty.value.latitude = parseFloat(addressData.lat)
        newProperty.value.longitude = parseFloat(addressData.lon)
        newProperty.value.country = addressData.country || 'GB'
        
        // Update address query
        addressQuery.value = addressData.formatted_address || addressData.address || ''
      }
    } catch (geocodeError) {
      console.error('Reverse geocoding error:', geocodeError)
      // Still set coordinates even if geocoding fails
      newProperty.value.latitude = lat
      newProperty.value.longitude = lng
    }
  } catch (error) {
    console.error('Map click error:', error)
  } finally {
    reverseGeocoding.value = false
  }
}

function cleanupPropertyMap() {
  if (propertyMapMarker.value) {
    propertyMapMarker.value.remove()
    propertyMapMarker.value = null
  }
  if (propertyMap.value) {
    propertyMap.value.remove()
    propertyMap.value = null
  }
  mapMarker.value = null
}

// Watch for modal open/close to initialize/cleanup map
watch(showAddProperty, (isOpen) => {
  if (isOpen) {
    // Use multiple delays for mobile devices
    nextTick(() => {
      // First attempt after DOM update
      setTimeout(() => {
        initPropertyMap()
      }, 100)
      
      // Second attempt for mobile (longer delay for modal animations)
      setTimeout(() => {
        if (showAddProperty.value && propertyMapContainer.value && !propertyMap.value) {
          initPropertyMap()
        }
      }, 500)
    })
  } else {
    cleanupPropertyMap()
  }
})

// Address autocomplete functions
async function fetchAddressSuggestions() {
  if (addressQuery.value.length < 3) {
    addressSuggestions.value = []
    showAddressSuggestions.value = false
    return
  }
  
  loadingAddressSuggestions.value = true
  try {
    const response = await $fetch('/api/address-autocomplete', {
      query: {
        q: addressQuery.value
      }
    })
    
    if (response.success && response.suggestions) {
      addressSuggestions.value = response.suggestions
      showAddressSuggestions.value = true
      selectedAddressIndex.value = -1
    } else {
      addressSuggestions.value = []
    }
  } catch (error) {
    console.error('Error fetching address suggestions:', error)
    addressSuggestions.value = []
  } finally {
    loadingAddressSuggestions.value = false
  }
}

function handleAddressInputFocus() {
  if (addressQuery.value.length >= 3 && addressSuggestions.value.length > 0) {
    showAddressSuggestions.value = true
  }
}

function hideAddressSuggestions() {
  setTimeout(() => {
    showAddressSuggestions.value = false
  }, 200)
}

function selectAddressSuggestion(suggestion: any) {
  if (!suggestion) return
  
  selectedAddress.value = suggestion
  addressQuery.value = suggestion.formatted_address
  
  // Populate form fields from the selected address
  newProperty.value.address = suggestion.formatted_address || suggestion.full_address || ''
  newProperty.value.city = suggestion.city || ''
  newProperty.value.state = suggestion.state || ''
  newProperty.value.postal_code = suggestion.postcode || ''
  
  // Capture latitude and longitude
  let lat: number | null = null
  let lng: number | null = null
  
  if (suggestion.lat) {
    lat = parseFloat(suggestion.lat)
    newProperty.value.latitude = lat
  }
  if (suggestion.lon) {
    lng = parseFloat(suggestion.lon)
    newProperty.value.longitude = lng
  }
  
  // Update map marker if coordinates are available
  if (lat !== null && lng !== null && propertyMap.value) {
    const { addMarker } = useMapbox()
    
    // Remove existing marker
    if (propertyMapMarker.value) {
      propertyMapMarker.value.remove()
    }
    
    // Add new marker
    propertyMapMarker.value = addMarker(propertyMap.value, lng, lat, {
      draggable: true,
      onDragEnd: async (newLng: number, newLat: number) => {
        await handleMapClick(newLng, newLat)
      }
    })
    
    // Center map on location
    propertyMap.value.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 1000
    })
    
    mapMarker.value = { lat, lng }
  }
  
  // Set country (API now returns ISO code directly)
  if (suggestion.country) {
    // API returns ISO code (2 letters), but handle edge cases
    if (suggestion.country.length === 2) {
      newProperty.value.country = suggestion.country.toUpperCase()
    } else {
      // Fallback mapping for full country names (shouldn't happen with updated API)
      const countryMap: Record<string, string> = {
        'United Kingdom': 'GB',
        'UK': 'GB',
        'United States': 'US',
        'USA': 'US'
      }
      newProperty.value.country = countryMap[suggestion.country] || 'GB'
    }
  } else {
    // Default to UK if no country found
    newProperty.value.country = 'GB'
  }
  
  showAddressSuggestions.value = false
  selectedAddressIndex.value = -1
}

async function createProperty() {
  const client = useSupabaseClient()
  const { data: { session } } = await client.auth.getSession()
  if (!session?.user?.id) return
  
  // Ensure address is set from addressQuery if not already set
  if (!newProperty.value.address && addressQuery.value) {
    newProperty.value.address = addressQuery.value
  }
  
  // Validate that latitude and longitude are present
  if (newProperty.value.latitude === null || newProperty.value.longitude === null) {
    alert('Please select an address from the suggestions to automatically populate location coordinates.')
    return
  }
  
  creatingProperty.value = true
  try {
    const { success, property } = await $fetch('/api/properties', {
      method: 'POST',
      body: {
        ...newProperty.value,
        user_id: session.user.id
      }
    })

    if (success) {
      properties.value.unshift(property)
      showAddProperty.value = false
      // Reset form
      newProperty.value = {
        property_name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'GB', // Default to UK
        property_type: 'residential',
        latitude: null,
        longitude: null
      }
      // Reset address autocomplete
      addressQuery.value = ''
      addressSuggestions.value = []
      showAddressSuggestions.value = false
      selectedAddress.value = null
      selectedAddressIndex.value = -1
      alert('Property created successfully! A default access code has been generated for this property.')
    }
  } catch (error) {
    console.error('Failed to create property:', error)
    alert('Failed to create property')
  } finally {
    creatingProperty.value = false
  }
}

async function createContact() {
  const client = useSupabaseClient()
  const { data: { session } } = await client.auth.getSession()
  if (!session?.user?.id) return
  
  creatingContact.value = true
  try {
    const { success, contact } = await $fetch('/api/contacts', {
      method: 'POST',
      body: {
        ...newContact.value,
        user_id: session.user.id
      }
    })

    if (success) {
      contacts.value.unshift(contact)
      
      // If a property is selected, automatically link the contact to it
      if (newContact.value.tenant_property_id) {
        try {
          const { success, propertyContact } = await $fetch('/api/property-contacts/add', {
            method: 'POST',
            body: {
              propertyId: newContact.value.tenant_property_id,
              contactId: contact.id,
              relationshipType: 'emergency_contact',
              canGrantAccess: false,
              notificationPriority: 1
            }
          })
          
          if (success) {
            console.log('Contact automatically linked to property')
          }
        } catch (error) {
          console.error('Failed to link contact to property:', error)
          // Don't fail the contact creation if property linking fails
        }
      }
      
      showAddContact.value = false
      // Reset form
      newContact.value = {
        contact_name: '',
        email: '',
        phone: '',
        relationship: '',
        is_primary: false,
        is_tenant: false,
        tenant_property_id: '',
        emergency_access_level: 'standard'
      }
      alert('Contact created successfully!')
    }
  } catch (error) {
    console.error('Failed to create contact:', error)
    alert('Failed to create contact')
  } finally {
    creatingContact.value = false
  }
}

async function viewPropertyDetails(property) {
  selectedProperty.value = property
  showPropertyDetails.value = true
  await loadPropertyContacts(property.id)
}

async function loadPropertyContacts(propertyId) {
  try {
    const { propertyContacts: data } = await $fetch('/api/property-contacts', {
      query: { propertyId }
    })
    propertyContacts.value = data || []
  } catch (error) {
    console.error('Failed to load property contacts:', error)
    propertyContacts.value = []
  }
}

async function addContactToProperty() {
  if (!selectedContactId.value || !selectedProperty.value) return
  
  addingContactToProperty.value = true
  try {
    const { success, propertyContact } = await $fetch('/api/property-contacts/add', {
      method: 'POST',
      body: {
        propertyId: selectedProperty.value.id,
        contactId: selectedContactId.value,
        relationshipType: newPropertyContact.value.relationship_type,
        canGrantAccess: newPropertyContact.value.can_grant_access,
        notificationPriority: newPropertyContact.value.notification_priority
      }
    })

    if (success) {
      propertyContacts.value.push(propertyContact)
      selectedContactId.value = ''
      newPropertyContact.value = {
        relationship_type: 'emergency_contact',
        can_grant_access: false,
        notification_priority: 1
      }
      alert('Contact added to property successfully!')
    }
  } catch (error) {
    console.error('Failed to add contact to property:', error)
    alert('Failed to add contact to property: ' + (error.data?.message || error.message))
  } finally {
    addingContactToProperty.value = false
  }
}

async function editContact(contact) {
  // Populate the editing form with contact data
  editingContact.value = {
    id: contact.id,
    contact_name: contact.contact_name,
    email: contact.email,
    phone: contact.phone || '',
    relationship: contact.relationship,
    is_primary: contact.is_primary,
    is_tenant: contact.is_tenant,
    tenant_property_id: contact.tenant_property_id || '',
    emergency_access_level: contact.emergency_access_level || 'standard'
  }
  showEditContact.value = true
}

async function updateContact() {
  updatingContact.value = true
  try {
    const { success, contact } = await $fetch('/api/contacts/update', {
      method: 'POST',
      body: editingContact.value
    })

    if (success) {
      // Update the contact in the frontend array
      const index = contacts.value.findIndex(c => c.id === editingContact.value.id)
      if (index > -1) {
        contacts.value[index] = contact
      }
      
      showEditContact.value = false
      alert('Contact updated successfully!')
    }
  } catch (error) {
    console.error('Failed to update contact:', error)
    alert('Failed to update contact: ' + (error.data?.message || error.message))
  } finally {
    updatingContact.value = false
  }
}

async function deleteContact(contactId) {
  if (!confirm('Are you sure you want to delete this contact? This will also remove them from all properties.')) return
  
  try {
    const { success } = await $fetch('/api/contacts/delete', {
      method: 'POST',
      body: { contactId }
    })

    if (success) {
      // Remove from frontend array
      const index = contacts.value.findIndex(c => c.id === contactId)
      if (index > -1) {
        contacts.value.splice(index, 1)
      }
      alert('Contact deleted successfully!')
    }
  } catch (error) {
    console.error('Failed to delete contact:', error)
    alert('Failed to delete contact')
  }
}

async function deleteProperty(propertyId) {
  if (!confirm('Are you sure you want to delete this property? This will also remove all associated contacts and access logs.')) return
  
  try {
    const { success } = await $fetch('/api/properties/delete', {
      method: 'POST',
      body: { propertyId }
    })

    if (success) {
      // Remove from frontend array
      const index = properties.value.findIndex(p => p.id === propertyId)
      if (index > -1) {
        properties.value.splice(index, 1)
      }
      alert('Property deleted successfully!')
    }
  } catch (error) {
    console.error('Failed to delete property:', error)
    alert('Failed to delete property')
  }
}

async function removeContactFromProperty(propertyContactId) {
  if (!confirm('Are you sure you want to remove this contact from the property?')) return
  
  try {
    const { success } = await $fetch('/api/property-contacts/delete', {
      method: 'POST',
      body: { propertyContactId }
    })

    if (success) {
      // Remove from frontend array
      const index = propertyContacts.value.findIndex(pc => pc.id === propertyContactId)
      if (index > -1) {
        propertyContacts.value.splice(index, 1)
      }
      alert('Contact removed from property successfully!')
    }
  } catch (error) {
    console.error('Failed to remove contact from property:', error)
    alert('Failed to remove contact from property')
  }
}

async function showQRCode(property) {
  selectedQRProperty.value = property
  showQRModal.value = true
  qrCodeLoading.value = true
  qrCodeData.value = null
  
  try {
    const response = await $fetch('/api/qr-code/generate', {
      method: 'POST',
      body: { property_id: property.id }
    })
    
    if (response.success) {
      qrCodeData.value = response
    }
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  } finally {
    qrCodeLoading.value = false
  }
}

function downloadQRCode() {
  if (!qrCodeData.value?.qr_data_url) return
  
  const link = document.createElement('a')
  link.href = qrCodeData.value.qr_data_url
  link.download = `qr-code-${selectedQRProperty.value?.property_name?.replace(/\s+/g, '-').toLowerCase() || 'property'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function copyQRUrl() {
  if (!qrCodeData.value?.qr_code) return
  
  try {
    await navigator.clipboard.writeText(qrCodeData.value.qr_code)
    alert('QR code URL copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy URL:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = qrCodeData.value.qr_code
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('QR code URL copied to clipboard!')
  }
}

// Edit property functions
async function editProperty(property) {
  editingProperty.value = {
    id: property.id,
    property_name: property.property_name,
    address: property.address,
    city: property.city,
    state: property.state || '',
    postal_code: property.postal_code || '',
    country: property.country || 'GB',
    property_type: property.property_type || 'residential',
    latitude: property.latitude ? parseFloat(property.latitude) : null,
    longitude: property.longitude ? parseFloat(property.longitude) : null
  }
  
  // Set address query for autocomplete
  editAddressQuery.value = property.address || ''
  
  // Set map marker if coordinates exist
  if (editingProperty.value.latitude && editingProperty.value.longitude) {
    editMapMarker.value = {
      lat: editingProperty.value.latitude,
      lng: editingProperty.value.longitude
    }
  }
  
  showEditProperty.value = true
}

async function updateProperty() {
  if (!editingProperty.value.id) return
  
  if (!editingProperty.value.latitude || !editingProperty.value.longitude) {
    alert('Please select a location on the map')
    return
  }
  
  updatingProperty.value = true
  try {
    const { success, property: updatedProperty } = await $fetch('/api/properties/update', {
      method: 'POST',
      body: {
        id: editingProperty.value.id,
        property_name: editingProperty.value.property_name,
        address: editingProperty.value.address,
        city: editingProperty.value.city,
        state: editingProperty.value.state,
        postal_code: editingProperty.value.postal_code,
        country: editingProperty.value.country,
        property_type: editingProperty.value.property_type,
        latitude: editingProperty.value.latitude,
        longitude: editingProperty.value.longitude
      }
    })

    if (success) {
      // Update the property in the frontend array
      const index = properties.value.findIndex(p => p.id === editingProperty.value.id)
      if (index > -1) {
        properties.value[index] = updatedProperty
      }
      
      showEditProperty.value = false
      alert('Property updated successfully!')
    }
  } catch (error) {
    console.error('Failed to update property:', error)
    alert('Failed to update property: ' + (error.data?.message || error.message))
  } finally {
    updatingProperty.value = false
  }
}

// Edit property map functions
function initEditPropertyMap() {
  if (!editPropertyMapContainer.value) return
  
  // Ensure we're on client side
  if (typeof window === 'undefined') return
  
  // Clean up existing map if any
  if (editPropertyMap.value) {
    try {
      editPropertyMap.value.remove()
    } catch (e) {
      // Map might already be removed
    }
    editPropertyMap.value = null
  }
  if (editPropertyMapMarker.value) {
    try {
      editPropertyMapMarker.value.remove()
    } catch (e) {
      // Marker might already be removed
    }
    editPropertyMapMarker.value = null
  }
  
  nextTick(() => {
    if (!editPropertyMapContainer.value) return
    
    const container = editPropertyMapContainer.value
    if (container instanceof HTMLElement) {
      container.style.display = 'block'
      container.style.visibility = 'visible'
      container.style.position = 'relative'
      
      requestAnimationFrame(() => {
        if (!editPropertyMapContainer.value) return
        
        const { initMap, addMarker, reverseGeocode } = useMapbox()
        
        // Initialize map at property location or default to UK
        const center: [number, number] = editingProperty.value.latitude && editingProperty.value.longitude
          ? [editingProperty.value.longitude, editingProperty.value.latitude]
          : [-2.2374, 53.4808]
        
        editPropertyMap.value = initMap(editPropertyMapContainer.value, {
          center,
          zoom: editingProperty.value.latitude && editingProperty.value.longitude ? 15 : 6,
          onMapClick: async (lng: number, lat: number) => {
            await handleEditMapClick(lng, lat)
          }
        })
        
        // Add existing marker if coordinates exist
        if (editingProperty.value.latitude && editingProperty.value.longitude) {
          editPropertyMapMarker.value = addMarker(editPropertyMap.value, editingProperty.value.longitude, editingProperty.value.latitude, {
            draggable: true,
            onDragEnd: async (newLng: number, newLat: number) => {
              await handleEditMapClick(newLng, newLat)
            }
          })
        }
        
        // Force resize
        if (editPropertyMap.value) {
          requestAnimationFrame(() => {
            if (editPropertyMap.value) {
              editPropertyMap.value.resize()
            }
          })
          setTimeout(() => {
            if (editPropertyMap.value) {
              editPropertyMap.value.resize()
            }
          }, 100)
          setTimeout(() => {
            if (editPropertyMap.value) {
              editPropertyMap.value.resize()
            }
          }, 500)
          editPropertyMap.value.on('load', () => {
            requestAnimationFrame(() => {
              if (editPropertyMap.value) {
                editPropertyMap.value.resize()
              }
            })
          })
        }
      })
    }
  })
}

async function handleEditMapClick(lng: number, lat: number) {
  if (!editPropertyMap.value) return
  
  editReverseGeocoding.value = true
  
  try {
    const { addMarker, reverseGeocode } = useMapbox()
    
    // Remove existing marker
    if (editPropertyMapMarker.value) {
      editPropertyMapMarker.value.remove()
    }
    
    // Add new marker
    editPropertyMapMarker.value = addMarker(editPropertyMap.value, lng, lat, {
      draggable: true,
      onDragEnd: async (newLng: number, newLat: number) => {
        await handleEditMapClick(newLng, newLat)
      }
    })
    
    editMapMarker.value = { lat, lng }
    
    // Reverse geocode to get address
    try {
      const addressData = await reverseGeocode(lng, lat)
      
      if (addressData) {
        // Populate form fields
        editingProperty.value.address = addressData.address || addressData.formatted_address || ''
        editingProperty.value.city = addressData.city || ''
        editingProperty.value.state = addressData.state || ''
        editingProperty.value.postal_code = addressData.postcode || ''
        editingProperty.value.latitude = parseFloat(addressData.lat)
        editingProperty.value.longitude = parseFloat(addressData.lon)
        editingProperty.value.country = addressData.country || 'GB'
        
        // Update address query
        editAddressQuery.value = addressData.formatted_address || addressData.address || ''
      }
    } catch (geocodeError) {
      console.error('Reverse geocoding error:', geocodeError)
      // Still set coordinates even if geocoding fails
      editingProperty.value.latitude = lat
      editingProperty.value.longitude = lng
    }
  } catch (error) {
    console.error('Map click error:', error)
  } finally {
    editReverseGeocoding.value = false
  }
}

// Edit address autocomplete functions
async function fetchEditAddressSuggestions() {
  if (editAddressQuery.value.length < 3) {
    editAddressSuggestions.value = []
    showEditAddressSuggestions.value = false
    return
  }
  
  loadingEditAddressSuggestions.value = true
  try {
    const response = await $fetch('/api/address-autocomplete', {
      query: {
        q: editAddressQuery.value
      }
    })
    
    if (response.success && response.suggestions) {
      editAddressSuggestions.value = response.suggestions
      showEditAddressSuggestions.value = true
    } else {
      editAddressSuggestions.value = []
      showEditAddressSuggestions.value = false
    }
  } catch (error) {
    console.error('Failed to fetch address suggestions:', error)
    editAddressSuggestions.value = []
    showEditAddressSuggestions.value = false
  } finally {
    loadingEditAddressSuggestions.value = false
  }
}

function handleEditAddressInputFocus() {
  if (editAddressQuery.value.length >= 3) {
    showEditAddressSuggestions.value = true
  }
}

function hideEditAddressSuggestions() {
  // Delay hiding to allow click events to fire
  setTimeout(() => {
    showEditAddressSuggestions.value = false
  }, 200)
}

function selectEditAddressSuggestion(suggestion: any) {
  editingProperty.value.address = suggestion.formatted_address || suggestion.address || ''
  editingProperty.value.city = suggestion.city || ''
  editingProperty.value.state = suggestion.state || ''
  editingProperty.value.postal_code = suggestion.postcode || ''
  editingProperty.value.country = suggestion.country || 'GB'
  editingProperty.value.latitude = parseFloat(suggestion.lat)
  editingProperty.value.longitude = parseFloat(suggestion.lon)
  
  editAddressQuery.value = suggestion.formatted_address || suggestion.address || ''
  showEditAddressSuggestions.value = false
  
  // Update map marker
  if (editPropertyMap.value && editingProperty.value.latitude && editingProperty.value.longitude) {
    const { addMarker } = useMapbox()
    
    // Remove existing marker
    if (editPropertyMapMarker.value) {
      editPropertyMapMarker.value.remove()
    }
    
    // Add new marker
    editPropertyMapMarker.value = addMarker(editPropertyMap.value, editingProperty.value.longitude, editingProperty.value.latitude, {
      draggable: true,
      onDragEnd: async (newLng: number, newLat: number) => {
        await handleEditMapClick(newLng, newLat)
      }
    })
    
    // Pan map to new location
    editPropertyMap.value.flyTo({
      center: [editingProperty.value.longitude, editingProperty.value.latitude],
      zoom: 15
    })
    
    editMapMarker.value = {
      lat: editingProperty.value.latitude,
      lng: editingProperty.value.longitude
    }
  }
}

function initPropertyDetailsMap() {
  if (!propertyDetailsMapContainer.value || !selectedProperty.value) return

  const lat = parseFloat(String(selectedProperty.value.latitude))
  const lng = parseFloat(String(selectedProperty.value.longitude))

  if (isNaN(lat) || isNaN(lng)) return

  // Ensure we're on client side and container is visible
  if (typeof window === 'undefined') return

  // Ensure container is visible and has dimensions
  const container = propertyDetailsMapContainer.value
  if (container instanceof HTMLElement) {
    container.style.display = 'block'
    container.style.visibility = 'visible'
    container.style.position = 'relative'
    container.style.width = '100%'
    container.style.height = '256px'
    container.style.minHeight = '256px'
    
    // Force a reflow
    void container.offsetHeight
  }
  
  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    if (!propertyDetailsMapContainer.value) return
    
    // Wait a bit longer for modal animation to complete
    setTimeout(() => {
      if (!propertyDetailsMapContainer.value) return
      
      // Use requestAnimationFrame for better mobile rendering
      requestAnimationFrame(() => {
        if (!propertyDetailsMapContainer.value) return
        
        const { initMap, addMarker } = useMapbox()
        
        // Initialize map centered on property location
        propertyDetailsMap.value = initMap(propertyDetailsMapContainer.value, {
          center: [lng, lat],
          zoom: 15
        })
        
        // Wait for map to load before adding marker and resizing
        if (propertyDetailsMap.value) {
          // Add marker immediately
          propertyDetailsMapMarker.value = addMarker(propertyDetailsMap.value, lng, lat, {
            draggable: false
          })
          
          // Listen for map load event to ensure tiles are loaded
          propertyDetailsMap.value.on('load', () => {
            // Force resize after map loads to ensure tiles render
            if (propertyDetailsMap.value) {
              propertyDetailsMap.value.resize()
            }
          })
          
          // Also listen for style.load in case load already fired
          propertyDetailsMap.value.on('style.load', () => {
            if (propertyDetailsMap.value) {
              propertyDetailsMap.value.resize()
            }
          })
          
          // Force resize multiple times to ensure proper rendering
          requestAnimationFrame(() => {
            if (propertyDetailsMap.value) {
              propertyDetailsMap.value.resize()
            }
          })
          
          setTimeout(() => {
            if (propertyDetailsMap.value) {
              propertyDetailsMap.value.resize()
            }
          }, 100)
          
          setTimeout(() => {
            if (propertyDetailsMap.value) {
              propertyDetailsMap.value.resize()
            }
          }, 300)
          
          setTimeout(() => {
            if (propertyDetailsMap.value) {
              propertyDetailsMap.value.resize()
            }
          }, 500)
        }
      })
    }, 300) // Increased delay for modal animation
  })
}

async function onLogout() {
  try {
    await auth.signOut()
    await navigateTo('/auth/login')
  } catch (err) {
    console.error(err)
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showProfileMenu.value = false
    }
  })
})

// Check if property has valid coordinates
function hasValidCoordinates(property: any): boolean {
  if (!property) return false
  
  // Handle both string and number types, and Decimal types from database
  const lat = property.latitude != null ? parseFloat(String(property.latitude)) : NaN
  const lng = property.longitude != null ? parseFloat(String(property.longitude)) : NaN
  
  const isValid = !isNaN(lat) && !isNaN(lng) && lat !== null && lng !== null && 
                  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  
  // Debug log for properties without coordinates
  if (!isValid && property.property_name) {
    console.debug(`Property "${property.property_name}" missing coordinates:`, { 
      latitude: property.latitude, 
      longitude: property.longitude 
    })
  }
  
  return isValid
}

// Get static map URL for property
function getPropertyMapUrl(lng: number | string, lat: number | string): string {
  try {
    const numLng = typeof lng === 'string' ? parseFloat(lng) : lng
    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat
    
    if (isNaN(numLng) || isNaN(numLat)) {
      return ''
    }
    
    const { getStaticMapUrl } = useMapbox()
    const url = getStaticMapUrl(numLng, numLat, 128, 96, 15)
    return url || ''
  } catch (error) {
    console.error('Error generating map URL:', error)
    return ''
  }
}

// Handle map image error
function handleMapImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // Instead of hiding, show a placeholder or log the error
  console.warn('Map image failed to load:', img.src)
  img.style.opacity = '0.3'
  img.alt = 'Map unavailable'
}
</script>
