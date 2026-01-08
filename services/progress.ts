import { supabase } from '../lib/supabase'

// Types for progress
export interface UserProgress {
  id: string
  user_id: string
  content_type: 'episode' | 'chapter' | 'resource'
  content_id: string
  progress_seconds: number
  is_completed: boolean
  last_played_at: string
}

export type ContentType = 'episode' | 'chapter' | 'resource'

export const progressService = {
  /**
   * Get all progress for current user
   */
  async getAll(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_played_at', { ascending: false })

    if (error) throw error
    return (data || []) as UserProgress[]
  },

  /**
   * Get progress for a specific content item
   */
  async get(
    userId: string,
    contentType: ContentType,
    contentId: string
  ): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as UserProgress
  },

  /**
   * Update progress for a content item
   */
  async update(
    userId: string,
    contentType: ContentType,
    contentId: string,
    progressSeconds: number
  ): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        progress_seconds: progressSeconds,
        last_played_at: new Date().toISOString()
      } as any, {
        onConflict: 'user_id,content_type,content_id'
      })
      .select()
      .single()

    if (error) throw error
    return data as UserProgress
  },

  /**
   * Mark content as completed
   */
  async markCompleted(
    userId: string,
    contentType: ContentType,
    contentId: string
  ): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        is_completed: true,
        last_played_at: new Date().toISOString()
      } as any, {
        onConflict: 'user_id,content_type,content_id'
      })
      .select()
      .single()

    if (error) throw error
    return data as UserProgress
  },

  /**
   * Get all completed items for user
   */
  async getCompleted(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('last_played_at', { ascending: false })

    if (error) throw error
    return (data || []) as UserProgress[]
  },

  /**
   * Get recently played items (continue watching/listening)
   */
  async getRecentlyPlayed(userId: string, limit: number = 5): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .gt('progress_seconds', 0)
      .order('last_played_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as UserProgress[]
  },

  /**
   * Delete progress for a content item
   */
  async delete(
    userId: string,
    contentType: ContentType,
    contentId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)

    if (error) throw error
  }
}
