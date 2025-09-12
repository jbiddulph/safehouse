import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  
  // Watch for auth state changes and handle session expiration
  watch(user, (newUser, oldUser) => {
    // If user was logged in but now is null, session expired
    if (oldUser && !newUser) {
      console.log('Session expired, clearing local state')
      // Clear any local state if needed
      // The user will be redirected by middleware
    }
  })

  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Sign in error:', error)
      throw error
    }
    return data
  }

  async function signUpWithEmail(email: string, password: string, fullName?: string, avatarFile?: File) {
    const { data, error } = await client.auth.signUp({ email, password })
    if (error) {
      console.error('Sign up error:', error)
      throw error
    }
    
    // Create profile if user was created and fullName is provided
    if (data.user && fullName) {
      try {
        const formData = new FormData()
        formData.append('userId', data.user.id)
        formData.append('fullName', fullName)
        formData.append('email', data.user.email)
        if (avatarFile) {
          formData.append('avatarFile', avatarFile)
        }

        await $fetch('/api/auth/create-profile', {
          method: 'POST',
          body: formData
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
    
    // Clear any local state
    if (process.client) {
      localStorage.removeItem('profile')
      localStorage.removeItem('avatar')
    }
  }
  
  // Check session validity and sign out if expired
  async function checkSession() {
    try {
      const { data: { session }, error } = await client.auth.getSession()
      
      if (error || !session) {
        console.log('Session invalid, signing out')
        await signOut()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Session check error:', error)
      await signOut()
      return false
    }
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

  return { user, signInWithEmail, signUpWithEmail, signOut, getProfile, checkSession }
})


