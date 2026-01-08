import { useState, useEffect, useCallback } from 'react'
import { progressService, type ContentType, type UserProgress } from '../services/progress'

interface UseProgressReturn {
  progress: UserProgress[]
  recentlyPlayed: UserProgress[]
  completed: UserProgress[]
  loading: boolean
  error: Error | null
  updateProgress: (contentType: ContentType, contentId: string, seconds: number) => Promise<void>
  markCompleted: (contentType: ContentType, contentId: string) => Promise<void>
  getProgress: (contentType: ContentType, contentId: string) => UserProgress | undefined
  refetch: () => Promise<void>
}

export function useProgress(userId: string | null): UseProgressReturn {
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<UserProgress[]>([])
  const [completed, setCompleted] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setProgress([])
      setRecentlyPlayed([])
      setCompleted([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [allProgress, recent, completedItems] = await Promise.all([
        progressService.getAll(userId),
        progressService.getRecentlyPlayed(userId, 5),
        progressService.getCompleted(userId)
      ])
      setProgress(allProgress)
      setRecentlyPlayed(recent)
      setCompleted(completedItems)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const updateProgress = useCallback(async (
    contentType: ContentType,
    contentId: string,
    seconds: number
  ) => {
    if (!userId) throw new Error('No user logged in')

    try {
      const updated = await progressService.update(userId, contentType, contentId, seconds)
      // Update local state
      setProgress(prev => {
        const existing = prev.findIndex(
          p => p.content_type === contentType && p.content_id === contentId
        )
        if (existing >= 0) {
          const newProgress = [...prev]
          newProgress[existing] = updated
          return newProgress
        }
        return [updated, ...prev]
      })
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [userId])

  const markCompleted = useCallback(async (
    contentType: ContentType,
    contentId: string
  ) => {
    if (!userId) throw new Error('No user logged in')

    try {
      const updated = await progressService.markCompleted(userId, contentType, contentId)
      // Update local state
      setProgress(prev => {
        const existing = prev.findIndex(
          p => p.content_type === contentType && p.content_id === contentId
        )
        if (existing >= 0) {
          const newProgress = [...prev]
          newProgress[existing] = updated
          return newProgress
        }
        return [updated, ...prev]
      })
      setCompleted(prev => [updated, ...prev.filter(
        p => !(p.content_type === contentType && p.content_id === contentId)
      )])
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [userId])

  const getProgress = useCallback((contentType: ContentType, contentId: string) => {
    return progress.find(
      p => p.content_type === contentType && p.content_id === contentId
    )
  }, [progress])

  return {
    progress,
    recentlyPlayed,
    completed,
    loading,
    error,
    updateProgress,
    markCompleted,
    getProgress,
    refetch: fetchProgress
  }
}
