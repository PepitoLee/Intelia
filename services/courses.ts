import { supabase } from '../lib/supabase'

// Types for courses
export interface Episode {
  id: string
  course_id: string
  title: string
  description: string | null
  duration: string | null
  audio_url: string | null
  order_index: number
  created_at: string
}

export interface Course {
  id: string
  title: string
  instructor: string
  cover_url: string | null
  level: 'Básico' | 'Intermedio' | 'Avanzado'
  tags: string[]
  total_duration: string | null
  created_at: string
}

export interface CourseWithEpisodes extends Course {
  episodes: Episode[]
}

export const coursesService = {
  /**
   * Get all courses with their episodes
   */
  async getAll(): Promise<CourseWithEpisodes[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        episodes (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Sort episodes by order_index
    return (data || []).map((course: any) => ({
      ...course,
      episodes: (course.episodes || []).sort((a: Episode, b: Episode) => a.order_index - b.order_index)
    }))
  },

  /**
   * Get a single course by ID with episodes
   */
  async getById(id: string): Promise<CourseWithEpisodes | null> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        episodes (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      ...data,
      episodes: ((data as any).episodes || []).sort((a: Episode, b: Episode) => a.order_index - b.order_index)
    } as CourseWithEpisodes
  },

  /**
   * Get courses by level
   */
  async getByLevel(level: Course['level']): Promise<CourseWithEpisodes[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        episodes (*)
      `)
      .eq('level', level)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((course: any) => ({
      ...course,
      episodes: (course.episodes || []).sort((a: Episode, b: Episode) => a.order_index - b.order_index)
    }))
  },

  /**
   * Search courses by title or tags
   */
  async search(query: string): Promise<CourseWithEpisodes[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        episodes (*)
      `)
      .or(`title.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((course: any) => ({
      ...course,
      episodes: (course.episodes || []).sort((a: Episode, b: Episode) => a.order_index - b.order_index)
    }))
  },

  /**
   * Get a single episode by ID
   */
  async getEpisode(episodeId: string): Promise<Episode | null> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as Episode
  },

  /**
   * Get all episodes for a course
   */
  async getEpisodesByCourse(courseId: string): Promise<Episode[]> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return (data || []) as Episode[]
  }
}
