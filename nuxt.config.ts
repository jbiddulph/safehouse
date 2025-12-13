// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes' }
      ],
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-LVMM6QM8KE',
          async: true
        }
      ]
    }
  },
  nitro: {
    preset: 'netlify',
    experimental: {
      wasm: true
    },
    // Ensure webhook endpoint can receive raw body
    routeRules: {
      '/api/stripe/webhook': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'stripe-signature, content-type'
        }
      }
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
    // DATABASE_URL removed - only needed for Prisma migrations (build-time), not runtime
    // Remove DATABASE_URL from Netlify environment variables to reduce Lambda size
    googleApiKey: process.env.GOOGLE_API,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      baseUrl: process.env.BASE_URL || process.env.NETLIFY_URL || 'https://mysafehouse.netlify.app',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      googleApiKey: process.env.GOOGLE_API,
      mapboxApiKey: process.env.MAPBOX_API,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
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