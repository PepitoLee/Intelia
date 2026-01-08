// Export all services for easy importing
export { authService, type Profile, type SignUpData, type SignInData } from './auth'
export { coursesService, type Course, type Episode, type CourseWithEpisodes } from './courses'
export { audiobooksService, type Audiobook, type Chapter, type AudiobookWithChapters } from './audiobooks'
export { resourcesService, type Resource } from './resources'
export { progressService, type UserProgress, type ContentType } from './progress'
export { favoritesService, type Favorite, type FavoriteContentType } from './favorites'

// Admin services
export { adminService, type CourseInput, type EpisodeInput, type AudiobookInput, type ChapterInput, type ResourceInput } from './admin'
export { storageService, type StorageBucket } from './storage'
