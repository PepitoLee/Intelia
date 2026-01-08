export type MediaType = 'podcast' | 'audiobook' | 'video' | 'pdf';

export interface AudiobookChapter {
  id: string;
  title: string;
  duration: string | null;
  audioUrl: string | null;
  orderIndex: number;
}

export interface MediaItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  type: MediaType;
  duration?: string; // For audio/video
  pages?: number; // For PDF
  isFavorite?: boolean;
  progress?: number;
  // Optional linkage to parent course
  courseTitle?: string;
  // Audio/video URL for playback
  audioUrl?: string;
  // For audiobooks - chapters
  chapters?: AudiobookChapter[];
}

export interface Episode {
  id: string;
  title: string;
  duration: string;
  description?: string;
  isCompleted?: boolean;
  audioUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  coverUrl: string;
  tags: string[]; // e.g. "ISO 22000", "BPM"
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  episodes: Episode[];
  totalDuration: string;
}

export interface Section {
  id: string;
  title: string;
  items: MediaItem[];
}

export type ViewState = 'home' | 'podcasts' | 'audiobooks' | 'resources' | 'library' | 'profile' | 'edit-profile' | 'admin' | 'admin-courses' | 'admin-audiobooks' | 'admin-resources';

export interface PlayerState {
  item: MediaItem | null;
  isPlaying: boolean;
  isExpanded: boolean;
  currentTime: number;
  duration: number;
  isStudyMode?: boolean; // New state for Idea 4
}

export interface UserData {
  name: string;
  handle: string;
  avatarUrl: string;
  memberSince: string;
  specialty?: string;
}