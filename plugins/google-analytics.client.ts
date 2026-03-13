export default defineNuxtPlugin(() => {
  const measurementId = 'G-LVMM6QM8KE'

  if (!process.client) return

  if (document.getElementById('google-analytics-gtag')) return

  window.dataLayer = window.dataLayer || []

  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }

  ;(window as any).gtag = gtag

  const script = document.createElement('script')
  script.id = 'google-analytics-gtag'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

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
