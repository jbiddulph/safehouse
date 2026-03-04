export default defineNuxtPlugin(() => {
  const measurementId = 'G-LVMM6QM8KE'

  if (!process.client) return

  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }

  ;(window as any).gtag = gtag

  gtag('js', new Date())
  // Disable the automatic first page view so we can consistently track via router hooks.
  gtag('config', measurementId, { send_page_view: false })

  const router = useRouter()

  const trackPageView = (fullPath: string) => {
    gtag('event', 'page_view', {
      page_title: document.title,
      page_path: fullPath,
      page_location: window.location.origin + fullPath
    })
  }

  trackPageView(router.currentRoute.value.fullPath)

  router.afterEach((to) => {
    trackPageView(to.fullPath)
  })
})
