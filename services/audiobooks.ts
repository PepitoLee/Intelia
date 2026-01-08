import { supabase } from '../lib/supabase'

// Types for audiobooks
export interface Chapter {
  id: string
  audiobook_id: string
  title: string
  duration: string | null
  audio_url: string | null
  order_index: number
}

export interface Audiobook {
  id: string
  title: string
  author: string
  cover_url: string | null
  total_duration: string | null
  created_at: string
}

export interface AudiobookWithChapters extends Audiobook {
  chapters: Chapter[]
}

export const audiobooksService = {
  /**
   * Get all audiobooks with their chapters
   */
  async getAll(): Promise<AudiobookWithChapters[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select(`
        *,
        chapters (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Sort chapters by order_index
    return (data || []).map((audiobook: any) => ({
      ...audiobook,
      chapters: (audiobook.chapters || []).sort((a: Chapter, b: Chapter) => a.order_index - b.order_index)
    }))
  },

  /**
   * Get a single audiobook by ID with chapters
   */
  async getById(id: string): Promise<AudiobookWithChapters | null> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select(`
        *,
        chapters (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      ...data,
      chapters: ((data as any).chapters || []).sort((a: Chapter, b: Chapter) => a.order_index - b.order_index)
    } as AudiobookWithChapters
  },

  /**
   * Search audiobooks by title or author
   */
  async search(query: string): Promise<AudiobookWithChapters[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select(`
        *,
        chapters (*)
      `)
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((audiobook: any) => ({
      ...audiobook,
      chapters: (audiobook.chapters || []).sort((a: Chapter, b: Chapter) => a.order_index - b.order_index)
    }))
  },

  /**
   * Get a single chapter by ID
   */
  async getChapter(chapterId: string): Promise<Chapter | null> {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as Chapter
  },

  /**
   * Get all chapters for an audiobook
   */
  async getChaptersByAudiobook(audiobookId: string): Promise<Chapter[]> {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('audiobook_id', audiobookId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return (data || []) as Chapter[]
  }
}
