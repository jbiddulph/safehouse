export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  if (to.path === '/auth/login' || to.path === '/auth/register') {
    const user = useSupabaseUser()
    if (user.value) {
      return navigateTo('/profile')
    }
  }
})


