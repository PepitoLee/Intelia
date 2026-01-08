import { useState, useEffect, useCallback } from 'react'
import { resourcesService, type Resource } from '../services/resources'

type ResourceFilter = 'all' | 'pdf' | 'video'

interface UseResourcesReturn {
  resources: Resource[]
  loading: boolean
  error: Error | null
  filter: ResourceFilter
  setFilter: (filter: ResourceFilter) => void
  refetch: () => Promise<void>
  getResourceById: (id: string) => Resource | undefined
  searchResources: (query: string) => Promise<void>
}

export function useResources(): UseResourcesReturn {
  const [resources, setResources] = useState<Resource[]>([])
  const [allResources, setAllResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filter, setFilterState] = useState<ResourceFilter>('all')

  const fetchResources = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await resourcesService.getAll()
      setAllResources(data)
      setResources(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  // Apply filter when it changes
  const setFilter = useCallback((newFilter: ResourceFilter) => {
    setFilterState(newFilter)
    if (newFilter === 'all') {
      setResources(allResources)
    } else {
      setResources(allResources.filter(r => r.type === newFilter))
    }
  }, [allResources])

  const getResourceById = useCallback((id: string) => {
    return allResources.find(resource => resource.id === id)
  }, [allResources])

  const searchResources = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchResources()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await resourcesService.search(query)
      setAllResources(data)
      // Apply current filter to search results
      if (filter === 'all') {
        setResources(data)
      } else {
        setResources(data.filter(r => r.type === filter))
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchResources, filter])

  return {
    resources,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchResources,
    getResourceById,
    searchResources
  }
}
