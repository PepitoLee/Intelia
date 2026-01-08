import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { authService, type Profile } from '../services/auth'

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch profile for a user
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await authService.getProfile(userId)
      setProfile(profileData)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      await authService.signIn({ email, password })
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign up
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setError(null)
    setLoading(true)
    try {
      await authService.signUp({ email, password, name })
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setError(null)
    try {
      await authService.signOut()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

    setError(null)
    try {
      const updatedProfile = await authService.updateProfile(user.id, updates)
      setProfile(updatedProfile)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [user])

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  return {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  }
}
