import { MediaItem, Course } from './types';

export const FEATURED_ITEMS: MediaItem[] = [
  {
    id: '1',
    title: 'Lean Six Sigma: Green Belt',
    author: 'Ing. Carlos Mendez',
    coverUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
    type: 'podcast',
    duration: '45 min',
    isFavorite: true
  },
  {
    id: '2',
    title: 'Gestión PMBOK 7',
    author: 'PMI Latam',
    coverUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&q=80&w=400',
    type: 'audiobook',
    duration: '3h 20m'
  },
  {
    id: '3',
    title: 'Seguridad Industrial',
    author: 'Academy Pro',
    coverUrl: 'https://images.unsplash.com/photo-1535953392427-dea96ab6eb45?auto=format&fit=crop&q=80&w=400',
    type: 'video',
    duration: '12 min'
  }
];

// Replaced generic podcasts with Engineering Courses structure
export const ENGINEERING_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Auditoría e implementación de sistemas de inocuidad alimentaria',
    instructor: 'Ing. Sofia Ramirez',
    coverUrl: 'https://images.unsplash.com/photo-1606859191214-25806e8e2423?auto=format&fit=crop&q=80&w=400',
    tags: ['BPM', 'HACCP', 'ISO 22000'],
    level: 'Avanzado',
    totalDuration: '30 min',
    episodes: [
      { id: 'e1-1', title: 'Calidad Total y Seguridad Alimentaria: De la Teoría a la Práctica', duration: '8:52' },
      { id: 'e1-2', title: 'Maestros de la Inocuidad: BPM, SOPs y SSOPs', duration: '9:49' },
      { id: 'e1-3', title: 'BPM y POES - Más Allá de las Normas', duration: '10:43' }
    ]
  },
  {
    id: 'c2',
    title: 'Lean Six Sigma aplicado a la mejora continua (Green Belt)',
    instructor: 'Six Sigma Institute',
    coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400',
    tags: ['Calidad', 'Lean', 'Estadística'],
    level: 'Intermedio',
    totalDuration: '25 min',
    episodes: [
      { id: 'e2-1', title: 'Lean Six Sigma - De los Villanos (3Ms) a la Ganancia', duration: '12:04' },
      { id: 'e2-2', title: 'Más Allá de DMAIC: Fase de Control', duration: '13:32' }
    ]
  },
  {
    id: 'c3',
    title: 'Gestión de Proyectos Basado en el PMBOK 7ma edición',
    instructor: 'PM Latam',
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400',
    tags: ['Proyectos', 'PMBOK', 'Agile'],
    level: 'Avanzado',
    totalDuration: '52 min',
    episodes: [
      { id: 'e3-1', title: 'PMBOK 7 y la Gestión de Proyectos en Latinoamérica', duration: '15:45' },
      { id: 'e3-2', title: 'PMBOK 7 Más Allá del Cronograma', duration: '17:03' },
      { id: 'e3-3', title: 'Proyectos Híbridos: PMBOK 7, Agile y VUCA', duration: '19:16' }
    ]
  },
  {
    id: 'c4',
    title: 'Supervisor de Seguridad y Salud en el Trabajo',
    instructor: 'Seguridad Total',
    coverUrl: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=400',
    tags: ['SSOMA', 'Seguridad', 'Normativa'],
    level: 'Básico',
    totalDuration: '45 min',
    episodes: [
      { id: 'e4-1', title: 'SSOMA en la Práctica: Trabajos de Alto Riesgo', duration: '14:20' },
      { id: 'e4-2', title: 'Del Estrés a la Ergonomía: Tu Salud Laboral', duration: '12:15' },
      { id: 'e4-3', title: 'SOMA Minero Perú: Salud y Ambiente', duration: '18:10' }
    ]
  }
];

export const PODCASTS: MediaItem[] = []; // Kept for type compatibility but not used in new view

export const AUDIOBOOKS: MediaItem[] = [
  { id: 'a1', title: 'Manual del Ingeniero', author: 'Editorial Técnica', coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400', type: 'audiobook', duration: '8h' },
  { id: 'a2', title: 'El Ziel', author: 'Eliyahu Goldratt', coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400', type: 'audiobook', duration: '21h' },
];

export const RESOURCES: MediaItem[] = [
  { id: 'r1', title: 'Norma ISO 9001:2015', author: 'PDF Oficial', coverUrl: 'https://images.unsplash.com/photo-1569091791842-7cf9646552dd?auto=format&fit=crop&q=80&w=400', type: 'pdf', pages: 45 },
  { id: 'r2', title: 'Matriz IPERC Modelo', author: 'Excel Template', coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400', type: 'pdf', pages: 12 },
  { id: 'r3', title: '5S Implementación', author: 'Video Guía', coverUrl: 'https://images.unsplash.com/photo-1581094794320-c9146a07e3cd?auto=format&fit=crop&q=80&w=400', type: 'video', duration: '08:45' },
];