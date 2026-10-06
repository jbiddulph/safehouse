/**
 * SPA page-view tracking for Google tag G-LVMM6QM8KE.
 * The gtag.js snippet itself is installed site-wide via nuxt.config app.head.
 * This plugin only records client-side route changes (no second tag).
 */
export default defineNuxtPlugin(() => {
  const measurementId = 'G-LVMM6QM8KE'
  const router = useRouter()
  let isInitialNavigation = true

  const trackPageView = (fullPath: string) => {
    const gtag = (window as any).gtag
    if (typeof gtag !== 'function') return

    gtag('event', 'page_view', {
      page_title: document.title,
      page_path: fullPath,
      page_location: window.location.origin + fullPath,
      send_to: measurementId
    })
  }

  // Initial page view is sent by the head snippet's gtag('config', ...).
  // Skip the first afterEach (initial load) to avoid a duplicate hit.
  router.afterEach((to) => {
    if (isInitialNavigation) {
      isInitialNavigation = false
      return
    }
    trackPageView(to.fullPath)
  })
})
