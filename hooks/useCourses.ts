import { useState, useEffect, useCallback } from 'react'
import { coursesService, type CourseWithEpisodes } from '../services/courses'

interface UseCoursesReturn {
  courses: CourseWithEpisodes[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  getCourseById: (id: string) => CourseWithEpisodes | undefined
  searchCourses: (query: string) => Promise<void>
}

export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<CourseWithEpisodes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await coursesService.getAll()
      setCourses(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const getCourseById = useCallback((id: string) => {
    return courses.find(course => course.id === id)
  }, [courses])

  const searchCourses = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchCourses()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await coursesService.search(query)
      setCourses(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchCourses])

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    getCourseById,
    searchCourses
  }
}

// Hook for a single course
interface UseCourseReturn {
  course: CourseWithEpisodes | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCourse(courseId: string): UseCourseReturn {
  const [course, setCourse] = useState<CourseWithEpisodes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setCourse(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await coursesService.getById(courseId)
      setCourse(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  return {
    course,
    loading,
    error,
    refetch: fetchCourse
  }
}
