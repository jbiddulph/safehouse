import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Sign in error:', error)
      throw error
    }
    return data
  }

  async function signUpWithEmail(email: string, password: string, fullName?: string) {
    const { data, error } = await client.auth.signUp({ email, password })
    if (error) {
      console.error('Sign up error:', error)
      throw error
    }
    
    // Create profile if user was created and fullName is provided
    if (data.user && fullName) {
      try {
        await $fetch('/api/auth/create-profile', {
          method: 'POST',
          body: {
            userId: data.user.id,
            fullName: fullName,
            email: data.user.email
          }
        })
      } catch (profileErr) {
        console.error('Profile creation error:', profileErr)
        // Don't throw here as the user was created successfully
      }
    }
    
    return data
  }

  async function signOut() {
    const { error } = await client.auth.signOut()
    if (error) throw error
  }

  async function getProfile() {
    if (!user.value) return null
    
    const { data, error } = await client
      .from('safehouse_profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    
    if (error) {
      console.error('Profile fetch error:', error)
      return null
    }
    
    return data
  }

  return { user, signInWithEmail, signUpWithEmail, signOut, getProfile }
})


