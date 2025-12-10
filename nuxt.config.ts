// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes' }
      ]
    }
  },
  nitro: {
    preset: 'netlify',
    experimental: {
      wasm: true
    }
  },
  vite: {
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['crypto-js']
    }
  },
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui', '@nuxt/icon', '@pinia/nuxt', '@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    mailtrapUser: process.env.MAILTRAP_USERNAME,
    mailtrapPass: process.env.MAILTRAP_PASSWORD,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    databaseUrl: process.env.DATABASE_URL,
    firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    googleApiKey: process.env.GOOGLE_API,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      baseUrl: process.env.BASE_URL || process.env.NETLIFY_URL || 'https://safehouse2025.netlify.app',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      googleApiKey: process.env.GOOGLE_API,
      mapboxApiKey: process.env.MAPBOX_API,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        vapidKey: process.env.FIREBASE_VAPID_KEY
      }
    }
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    clientOptions: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      }
    },
    redirect: false
  }
})