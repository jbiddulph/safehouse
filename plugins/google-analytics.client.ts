export default defineNuxtPlugin(() => {
  // Initialize Google Analytics
  if (process.client) {
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    
    // Make gtag available globally
    ;(window as any).gtag = gtag
    
    gtag('js', new Date())
    gtag('config', 'G-LVMM6QM8KE')
  }
})

