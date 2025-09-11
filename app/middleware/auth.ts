export default defineNuxtRouteMiddleware(() => {
  // Avoid redirect loops during SSR where user is not yet resolved
  if (import.meta.server) return
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/auth/login')
  }
})


