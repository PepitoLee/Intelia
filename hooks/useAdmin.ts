import { useState, useEffect, useCallback } from 'react'
import { adminService, type CourseInput, type EpisodeInput, type AudiobookInput, type ChapterInput, type ResourceInput } from '../services/admin'
import { storageService } from '../services/storage'

interface AdminStats {
  totalCourses: number
  totalAudiobooks: number
  totalResources: number
  totalUsers: number
}

interface UseAdminReturn {
  // State
  isAdmin: boolean
  loading: boolean
  error: Error | null
  stats: AdminStats | null

  // Courses
  courses: any[]
  createCourse: (input: CourseInput) => Promise<any>
  updateCourse: (id: string, input: Partial<CourseInput>) => Promise<any>
  deleteCourse: (id: string) => Promise<void>

  // Episodes
  createEpisode: (input: EpisodeInput) => Promise<any>
  updateEpisode: (id: string, input: Partial<EpisodeInput>) => Promise<any>
  deleteEpisode: (id: string) => Promise<void>

  // Audiobooks
  audiobooks: any[]
  createAudiobook: (input: AudiobookInput) => Promise<any>
  updateAudiobook: (id: string, input: Partial<AudiobookInput>) => Promise<any>
  deleteAudiobook: (id: string) => Promise<void>

  // Chapters
  createChapter: (input: ChapterInput) => Promise<any>
  updateChapter: (id: string, input: Partial<ChapterInput>) => Promise<any>
  deleteChapter: (id: string) => Promise<void>

  // Resources
  resources: any[]
  createResource: (input: ResourceInput) => Promise<any>
  updateResource: (id: string, input: Partial<ResourceInput>) => Promise<any>
  deleteResource: (id: string) => Promise<void>

  // File uploads
  uploadAudio: (file: File) => Promise<string>
  uploadVideo: (file: File) => Promise<string>
  uploadPDF: (file: File) => Promise<string>
  uploadCover: (file: File) => Promise<string>

  // Refresh
  refetch: () => Promise<void>
}

export function useAdmin(): UseAdminReturn {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [audiobooks, setAudiobooks] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])

  // Check admin status and fetch data
  const fetchAdminData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if user is admin
      const adminStatus = await adminService.isAdmin()
      setIsAdmin(adminStatus)

      if (adminStatus) {
        // Fetch all data in parallel
        const [statsData, coursesData, audiobooksData, resourcesData] = await Promise.all([
          adminService.getStats(),
          adminService.getAllCourses(),
          adminService.getAllAudiobooks(),
          adminService.getAllResources()
        ])

        setStats(statsData)
        setCourses(coursesData || [])
        setAudiobooks(audiobooksData || [])
        setResources(resourcesData || [])
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  // =============================================
  // COURSES
  // =============================================

  const createCourse = useCallback(async (input: CourseInput) => {
    const newCourse = await adminService.createCourse(input)
    setCourses(prev => [{ ...newCourse, episodes: [] }, ...prev])
    setStats(prev => prev ? { ...prev, totalCourses: prev.totalCourses + 1 } : null)
    return newCourse
  }, [])

  const updateCourse = useCallback(async (id: string, input: Partial<CourseInput>) => {
    const updated = await adminService.updateCourse(id, input)
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    return updated
  }, [])

  const deleteCourse = useCallback(async (id: string) => {
    await adminService.deleteCourse(id)
    setCourses(prev => prev.filter(c => c.id !== id))
    setStats(prev => prev ? { ...prev, totalCourses: prev.totalCourses - 1 } : null)
  }, [])

  // =============================================
  // EPISODES
  // =============================================

  const createEpisode = useCallback(async (input: EpisodeInput) => {
    const newEpisode = await adminService.createEpisode(input)
    setCourses(prev => prev.map(c =>
      c.id === input.course_id
        ? { ...c, episodes: [...(c.episodes || []), newEpisode] }
        : c
    ))
    return newEpisode
  }, [])

  const updateEpisode = useCallback(async (id: string, input: Partial<EpisodeInput>) => {
    const updated = await adminService.updateEpisode(id, input)
    setCourses(prev => prev.map(c => ({
      ...c,
      episodes: c.episodes?.map((e: any) => e.id === id ? { ...e, ...updated } : e) || []
    })))
    return updated
  }, [])

  const deleteEpisode = useCallback(async (id: string) => {
    await adminService.deleteEpisode(id)
    setCourses(prev => prev.map(c => ({
      ...c,
      episodes: c.episodes?.filter((e: any) => e.id !== id) || []
    })))
  }, [])

  // =============================================
  // AUDIOBOOKS
  // =============================================

  const createAudiobook = useCallback(async (input: AudiobookInput) => {
    const newAudiobook = await adminService.createAudiobook(input)
    setAudiobooks(prev => [{ ...newAudiobook, chapters: [] }, ...prev])
    setStats(prev => prev ? { ...prev, totalAudiobooks: prev.totalAudiobooks + 1 } : null)
    return newAudiobook
  }, [])

  const updateAudiobook = useCallback(async (id: string, input: Partial<AudiobookInput>) => {
    const updated = await adminService.updateAudiobook(id, input)
    setAudiobooks(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a))
    return updated
  }, [])

  const deleteAudiobook = useCallback(async (id: string) => {
    await adminService.deleteAudiobook(id)
    setAudiobooks(prev => prev.filter(a => a.id !== id))
    setStats(prev => prev ? { ...prev, totalAudiobooks: prev.totalAudiobooks - 1 } : null)
  }, [])

  // =============================================
  // CHAPTERS
  // =============================================

  const createChapter = useCallback(async (input: ChapterInput) => {
    const newChapter = await adminService.createChapter(input)
    setAudiobooks(prev => prev.map(a =>
      a.id === input.audiobook_id
        ? { ...a, chapters: [...(a.chapters || []), newChapter] }
        : a
    ))
    return newChapter
  }, [])

  const updateChapter = useCallback(async (id: string, input: Partial<ChapterInput>) => {
    const updated = await adminService.updateChapter(id, input)
    setAudiobooks(prev => prev.map(a => ({
      ...a,
      chapters: a.chapters?.map((ch: any) => ch.id === id ? { ...ch, ...updated } : ch) || []
    })))
    return updated
  }, [])

  const deleteChapter = useCallback(async (id: string) => {
    await adminService.deleteChapter(id)
    setAudiobooks(prev => prev.map(a => ({
      ...a,
      chapters: a.chapters?.filter((ch: any) => ch.id !== id) || []
    })))
  }, [])

  // =============================================
  // RESOURCES
  // =============================================

  const createResource = useCallback(async (input: ResourceInput) => {
    const newResource = await adminService.createResource(input)
    setResources(prev => [newResource, ...prev])
    setStats(prev => prev ? { ...prev, totalResources: prev.totalResources + 1 } : null)
    return newResource
  }, [])

  const updateResource = useCallback(async (id: string, input: Partial<ResourceInput>) => {
    const updated = await adminService.updateResource(id, input)
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r))
    return updated
  }, [])

  const deleteResource = useCallback(async (id: string) => {
    await adminService.deleteResource(id)
    setResources(prev => prev.filter(r => r.id !== id))
    setStats(prev => prev ? { ...prev, totalResources: prev.totalResources - 1 } : null)
  }, [])

  // =============================================
  // FILE UPLOADS
  // =============================================

  const uploadAudio = useCallback(async (file: File) => {
    return await storageService.uploadAudio(file)
  }, [])

  const uploadVideo = useCallback(async (file: File) => {
    return await storageService.uploadVideo(file)
  }, [])

  const uploadPDF = useCallback(async (file: File) => {
    return await storageService.uploadPDF(file)
  }, [])

  const uploadCover = useCallback(async (file: File) => {
    return await storageService.uploadCover(file)
  }, [])

  return {
    isAdmin,
    loading,
    error,
    stats,
    courses,
    createCourse,
    updateCourse,
    deleteCourse,
    createEpisode,
    updateEpisode,
    deleteEpisode,
    audiobooks,
    createAudiobook,
    updateAudiobook,
    deleteAudiobook,
    createChapter,
    updateChapter,
    deleteChapter,
    resources,
    createResource,
    updateResource,
    deleteResource,
    uploadAudio,
    uploadVideo,
    uploadPDF,
    uploadCover,
    refetch: fetchAdminData
  }
}
