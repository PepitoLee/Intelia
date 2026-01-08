import { supabase } from '../lib/supabase'

// Types for favorites
export interface Favorite {
  id: string
  user_id: string
  content_type: 'course' | 'audiobook' | 'resource'
  content_id: string
  created_at: string
}

export type FavoriteContentType = 'course' | 'audiobook' | 'resource'

export const favoritesService = {
  /**
   * Get all favorites for current user
   */
  async getAll(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Favorite[]
  },

  /**
   * Check if an item is favorited
   */
  async isFavorite(
    userId: string,
    contentType: FavoriteContentType,
    contentId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return false
      throw error
    }

    return !!data
  },

  /**
   * Add item to favorites
   */
  async add(
    userId: string,
    contentType: FavoriteContentType,
    contentId: string
  ): Promise<Favorite> {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId
      } as any)
      .select()
      .single()

    if (error) throw error
    return data as Favorite
  },

  /**
   * Remove item from favorites
   */
  async remove(
    userId: string,
    contentType: FavoriteContentType,
    contentId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)

    if (error) throw error
  },

  /**
   * Toggle favorite status
   */
  async toggle(
    userId: string,
    contentType: FavoriteContentType,
    contentId: string
  ): Promise<boolean> {
    const isFav = await this.isFavorite(userId, contentType, contentId)

    if (isFav) {
      await this.remove(userId, contentType, contentId)
      return false
    } else {
      await this.add(userId, contentType, contentId)
      return true
    }
  },

  /**
   * Get favorites by type
   */
  async getByType(
    userId: string,
    contentType: FavoriteContentType
  ): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Favorite[]
  },

  /**
   * Get favorite courses
   */
  async getFavoriteCourses(userId: string): Promise<Favorite[]> {
    return this.getByType(userId, 'course')
  },

  /**
   * Get favorite audiobooks
   */
  async getFavoriteAudiobooks(userId: string): Promise<Favorite[]> {
    return this.getByType(userId, 'audiobook')
  },

  /**
   * Get favorite resources
   */
  async getFavoriteResources(userId: string): Promise<Favorite[]> {
    return this.getByType(userId, 'resource')
  }
}
