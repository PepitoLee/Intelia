import { useState, useEffect, useCallback } from 'react'
import { favoritesService, type FavoriteContentType, type Favorite } from '../services/favorites'

interface UseFavoritesReturn {
  favorites: Favorite[]
  loading: boolean
  error: Error | null
  isFavorite: (contentType: FavoriteContentType, contentId: string) => boolean
  toggleFavorite: (contentType: FavoriteContentType, contentId: string) => Promise<boolean>
  getFavoritesByType: (contentType: FavoriteContentType) => Favorite[]
  refetch: () => Promise<void>
}

export function useFavorites(userId: string | null): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await favoritesService.getAll(userId)
      setFavorites(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorite = useCallback((contentType: FavoriteContentType, contentId: string) => {
    return favorites.some(
      f => f.content_type === contentType && f.content_id === contentId
    )
  }, [favorites])

  const toggleFavorite = useCallback(async (
    contentType: FavoriteContentType,
    contentId: string
  ): Promise<boolean> => {
    if (!userId) throw new Error('No user logged in')

    try {
      const isFav = isFavorite(contentType, contentId)

      if (isFav) {
        await favoritesService.remove(userId, contentType, contentId)
        setFavorites(prev => prev.filter(
          f => !(f.content_type === contentType && f.content_id === contentId)
        ))
        return false
      } else {
        const newFavorite = await favoritesService.add(userId, contentType, contentId)
        setFavorites(prev => [newFavorite, ...prev])
        return true
      }
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [userId, isFavorite])

  const getFavoritesByType = useCallback((contentType: FavoriteContentType) => {
    return favorites.filter(f => f.content_type === contentType)
  }, [favorites])

  return {
    favorites,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    getFavoritesByType,
    refetch: fetchFavorites
  }
}
