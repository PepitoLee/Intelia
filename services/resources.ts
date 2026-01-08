import { supabase } from '../lib/supabase'

// Types for resources
export interface Resource {
  id: string
  title: string
  author: string | null
  type: 'pdf' | 'video'
  cover_url: string | null
  file_url: string | null
  pages: number | null
  duration: string | null
  created_at: string
}

export const resourcesService = {
  /**
   * Get all resources
   */
  async getAll(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Resource[]
  },

  /**
   * Get a single resource by ID
   */
  async getById(id: string): Promise<Resource | null> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as Resource
  },

  /**
   * Get resources by type (pdf or video)
   */
  async getByType(type: Resource['type']): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Resource[]
  },

  /**
   * Search resources by title or author
   */
  async search(query: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Resource[]
  },

  /**
   * Get PDFs only
   */
  async getPDFs(): Promise<Resource[]> {
    return this.getByType('pdf')
  },

  /**
   * Get videos only
   */
  async getVideos(): Promise<Resource[]> {
    return this.getByType('video')
  }
}
