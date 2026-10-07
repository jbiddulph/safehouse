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
      // Security headers for SSR/API responses (Netlify.toml also sets these at the CDN edge)
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(self), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), payment=(self), usb=()',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://checkout.stripe.com https://hooks.stripe.com; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: blob: https://*.supabase.co https://*.mapbox.com https://api.mapbox.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self' data: https://api.mapbox.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.analytics.google.com https://api.stripe.com https://maps.googleapis.com; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https://www.googletagmanager.com https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com; media-src 'self'; upgrade-insecure-requests"
        }
      },
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
    // Server-only secret — never expose via runtimeConfig.public
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Twilio (server-side only)
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_SECRET,
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER,
    // DATABASE_URL removed - only needed for Prisma migrations (build-time), not runtime
    // Remove DATABASE_URL from Netlify environment variables to reduce Lambda size
    // Google Places is used only via server proxy (/api/address-autocomplete) — keep server-only
    googleApiKey: process.env.GOOGLE_API,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    public: {
      baseUrl: process.env.BASE_URL || process.env.NETLIFY_URL || 'https://mysafehouse.co.uk',
      // Public Supabase client credentials (from env). Safe/expected in the browser;
      // protect data with RLS, not by hiding these values.
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      // Mapbox GL requires a browser token. Restrict it by URL in the Mapbox dashboard.
      mapboxApiKey: process.env.MAPBOX_API,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  },
  supabase: {
    // Loaded from environment variables — do not hardcode project URL/keys here
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
