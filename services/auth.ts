import { supabase } from '../lib/supabase'

// Types for auth
export interface Profile {
  id: string
  name: string | null
  handle: string | null
  avatar_url: string | null
  specialty: string | null
  created_at: string
}

export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp({ email, password, name }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (error) throw error

    // Create profile after signup
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        handle: `@${name.toLowerCase().replace(/\s+/g, '_')}`,
        created_at: new Date().toISOString()
      } as any)
    }

    return data
  },

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Get the current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  /**
   * Get the current user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  /**
   * Get user profile from profiles table
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data as Profile
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as Profile
  },

  /**
   * Sign in with OAuth provider (Google, GitHub, etc.)
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'apple') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    })

    if (error) throw error
    return data
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  },

  /**
   * Update user specialty/career
   */
  async updateSpecialty(userId: string, specialty: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ specialty })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as Profile
  }
}
