// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en-GB'
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes' },
        {
          name: 'description',
          content: 'MySafeHouse helps emergency services gain secure, time-critical access to your home when emergency or standard access is requested.'
        },
        {
          httpEquiv: 'Content-Language',
          content: 'en-GB'
        }
      ],
      titleTemplate: (title?: string) => {
        return title ? `${title} | MySafeHouse` : 'MySafeHouse – secure emergency access to your home'
      },
      // Google Tag Manager — GTM-PDQQ5MB7 (as high in <head> as possible)
      script: [
        {
          key: 'google-tag-manager',
          // Lower number = earlier in <head> (must precede GA scripts)
          tagPriority: -30,
          innerHTML: "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PDQQ5MB7');"
        },
        // Google tag (gtag.js) — G-LVMM6QM8KE
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-LVMM6QM8KE',
          async: true,
          tagPriority: 1
        },
        {
          key: 'google-analytics-init',
          type: 'text/javascript',
          tagPriority: 2,
          innerHTML: "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-LVMM6QM8KE');"
        }
      ],
      // Google Tag Manager (noscript) — immediately after opening <body>
      noscript: [
        {
          key: 'google-tag-manager-noscript',
          tagPosition: 'bodyOpen',
          innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PDQQ5MB7" height="0" width="0" style="display:none;visibility:hidden"></iframe>'
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
    },
    hooks: {
      'nitro:build:before': (nitro) => {
        // Ensure imports field is available for #internal paths
        const pkg = nitro.options.packageJson || {}
        if (!pkg.imports) {
          pkg.imports = {}
        }
        // For Netlify, the .nuxt directory is at the root of the function
        pkg.imports['#internal/*'] = './.nuxt/*'
        nitro.options.packageJson = pkg
      },
      'nitro:build:after': async (nitro) => {
        // Ensure imports field is in the generated package.json after build
        const outputDir = nitro.options.output.dir
        const pkgPath = `${outputDir}/package.json`
        try {
          const { readFileSync, writeFileSync, existsSync } = await import('fs')
          if (existsSync(pkgPath)) {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
            if (!pkg.imports) {
              pkg.imports = {}
            }
            // For Netlify serverless functions, .nuxt is at the function root
            pkg.imports['#internal/*'] = './.nuxt/*'
            writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
            console.log('✓ Added imports field to generated package.json')
          }
        } catch (error) {
          console.warn('Failed to update generated package.json:', error)
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
    // Twilio (server-side only)
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_SECRET,
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER,
    // DATABASE_URL removed - only needed for Prisma migrations (build-time), not runtime
    // Remove DATABASE_URL from Netlify environment variables to reduce Lambda size
    googleApiKey: process.env.GOOGLE_API,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      baseUrl: process.env.BASE_URL || process.env.NETLIFY_URL || 'https://mysafehouse.co.uk',
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
