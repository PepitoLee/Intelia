import { supabase } from '../lib/supabase'

// =============================================
// TYPES
// =============================================

export interface CourseInput {
  title: string
  instructor: string
  cover_url?: string
  level: 'Básico' | 'Intermedio' | 'Avanzado'
  tags: string[]
  total_duration?: string
}

export interface EpisodeInput {
  course_id: string
  title: string
  description?: string
  duration: string
  audio_url?: string
  order_index: number
}

export interface AudiobookInput {
  title: string
  author: string
  cover_url?: string
  total_duration?: string
}

export interface ChapterInput {
  audiobook_id: string
  title: string
  duration: string
  audio_url?: string
  order_index: number
}

export interface ResourceInput {
  title: string
  author?: string
  type: 'pdf' | 'video'
  cover_url?: string
  file_url?: string
  pages?: number
  duration?: string
}

export interface Profile {
  id: string
  name: string | null
  handle: string | null
  avatar_url: string | null
  specialty: string | null
  role: 'user' | 'admin'
  created_at: string
}

// =============================================
// ADMIN SERVICE
// =============================================

export const adminService = {
  // =============================================
  // ADMIN CHECK
  // =============================================

  /**
   * Check if current user is admin
   */
  async isAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !data) return false
    return data.role === 'admin'
  },

  /**
   * Get current user's profile with role
   */
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) return null
    return data as Profile
  },

  // =============================================
  // COURSES CRUD
  // =============================================

  async createCourse(input: CourseInput) {
    const { data, error } = await supabase
      .from('courses')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCourse(id: string, input: Partial<CourseInput>) {
    const { data, error } = await supabase
      .from('courses')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        episodes (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // =============================================
  // EPISODES CRUD
  // =============================================

  async createEpisode(input: EpisodeInput) {
    const { data, error } = await supabase
      .from('episodes')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateEpisode(id: string, input: Partial<EpisodeInput>) {
    const { data, error } = await supabase
      .from('episodes')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEpisode(id: string) {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getEpisodesByCourse(courseId: string) {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data
  },

  // =============================================
  // AUDIOBOOKS CRUD
  // =============================================

  async createAudiobook(input: AudiobookInput) {
    const { data, error } = await supabase
      .from('audiobooks')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateAudiobook(id: string, input: Partial<AudiobookInput>) {
    const { data, error } = await supabase
      .from('audiobooks')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteAudiobook(id: string) {
    const { error } = await supabase
      .from('audiobooks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllAudiobooks() {
    const { data, error } = await supabase
      .from('audiobooks')
      .select(`
        *,
        chapters (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // =============================================
  // CHAPTERS CRUD
  // =============================================

  async createChapter(input: ChapterInput) {
    const { data, error } = await supabase
      .from('chapters')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateChapter(id: string, input: Partial<ChapterInput>) {
    const { data, error } = await supabase
      .from('chapters')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteChapter(id: string) {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getChaptersByAudiobook(audiobookId: string) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('audiobook_id', audiobookId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data
  },

  // =============================================
  // RESOURCES CRUD
  // =============================================

  async createResource(input: ResourceInput) {
    const { data, error } = await supabase
      .from('resources')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateResource(id: string, input: Partial<ResourceInput>) {
    const { data, error } = await supabase
      .from('resources')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteResource(id: string) {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllResources() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // =============================================
  // STATS
  // =============================================

  async getStats() {
    const [courses, audiobooks, resources, profiles] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact' }),
      supabase.from('audiobooks').select('id', { count: 'exact' }),
      supabase.from('resources').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' })
    ])

    return {
      totalCourses: courses.count || 0,
      totalAudiobooks: audiobooks.count || 0,
      totalResources: resources.count || 0,
      totalUsers: profiles.count || 0
    }
  }
}
