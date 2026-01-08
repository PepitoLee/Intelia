import { useState, useEffect, useCallback } from 'react'
import { audiobooksService, type AudiobookWithChapters } from '../services/audiobooks'

interface UseAudiobooksReturn {
  audiobooks: AudiobookWithChapters[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  getAudiobookById: (id: string) => AudiobookWithChapters | undefined
  searchAudiobooks: (query: string) => Promise<void>
}

export function useAudiobooks(): UseAudiobooksReturn {
  const [audiobooks, setAudiobooks] = useState<AudiobookWithChapters[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAudiobooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await audiobooksService.getAll()
      setAudiobooks(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAudiobooks()
  }, [fetchAudiobooks])

  const getAudiobookById = useCallback((id: string) => {
    return audiobooks.find(audiobook => audiobook.id === id)
  }, [audiobooks])

  const searchAudiobooks = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchAudiobooks()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await audiobooksService.search(query)
      setAudiobooks(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchAudiobooks])

  return {
    audiobooks,
    loading,
    error,
    refetch: fetchAudiobooks,
    getAudiobookById,
    searchAudiobooks
  }
}

// Hook for a single audiobook
interface UseAudiobookReturn {
  audiobook: AudiobookWithChapters | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAudiobook(audiobookId: string): UseAudiobookReturn {
  const [audiobook, setAudiobook] = useState<AudiobookWithChapters | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAudiobook = useCallback(async () => {
    if (!audiobookId) {
      setAudiobook(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await audiobooksService.getById(audiobookId)
      setAudiobook(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [audiobookId])

  useEffect(() => {
    fetchAudiobook()
  }, [fetchAudiobook])

  return {
    audiobook,
    loading,
    error,
    refetch: fetchAudiobook
  }
}
