import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Headphones,
  BookOpen,
  FolderOpen,
  Library,
  Search,
  Menu,
  Play,
  Pause,
  Heart,
  ListMusic,
  MoreHorizontal,
  ChevronDown,
  FileText,
  Video,
  User,
  Zap,
  LogOut,
  TrendingUp,
  Award,
  ChevronRight,
  Camera,
  X,
  Check,
  Book,
  Download,
  RotateCcw,
  RotateCw,
  Sun,
  Moon,
  Mail,
  Lock,
  ArrowRight,
  Fingerprint,
  Shield,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Save,
  ArrowLeft,
  Music,
  Film,
  FileUp,
  Image,
  Share,
  Smartphone,
  GraduationCap
} from 'lucide-react';
import { MediaItem, ViewState, PlayerState, UserData, Course, Episode, MediaType } from './types';
import { authService } from './services/auth';
import { adminService } from './services/admin';
import { coursesService, CourseWithEpisodes } from './services/courses';
import { audiobooksService, AudiobookWithChapters } from './services/audiobooks';
import { resourcesService, Resource } from './services/resources';
import { supabase } from './lib/supabase';
import { useAdmin } from './hooks/useAdmin';

// --- Data Transform Functions ---
// Transform Supabase data to match UI types

const transformCourseToUIFormat = (course: CourseWithEpisodes): Course => ({
  id: course.id,
  title: course.title,
  instructor: course.instructor,
  coverUrl: course.cover_url || '',
  tags: course.tags || [],
  level: course.level,
  totalDuration: course.total_duration || '',
  episodes: (course.episodes || []).map(ep => ({
    id: ep.id,
    title: ep.title,
    duration: ep.duration || '',
    description: ep.description || undefined,
    isCompleted: false,
    audioUrl: ep.audio_url || undefined
  }))
});

const transformAudiobookToMediaItem = (ab: AudiobookWithChapters): MediaItem => ({
  id: ab.id,
  title: ab.title,
  author: ab.author,
  coverUrl: ab.cover_url || '',
  type: 'audiobook' as MediaType,
  duration: ab.total_duration || '',
  chapters: ab.chapters?.map(ch => ({
    id: ch.id,
    title: ch.title,
    duration: ch.duration,
    audioUrl: ch.audio_url,
    orderIndex: ch.order_index
  })).sort((a, b) => a.orderIndex - b.orderIndex)
});

const transformResourceToMediaItem = (r: Resource): MediaItem => ({
  id: r.id,
  title: r.title,
  author: r.author || '',
  coverUrl: r.cover_url || '',
  type: r.type as MediaType,
  duration: r.duration || undefined,
  pages: r.pages || undefined
});

// --- Branding Icons ---

const InteliaLogo = ({ className = "text-brand-500" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 4H16V12H20V20H12V12H8V20H4V4Z" fill="currentColor" fillOpacity="0.2"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 4H4V12H12V4ZM16 12H20V20H12V12H16Z" fill="currentColor"/>
    {/* Stylized abstract 'A' / geometric shape based on Intelia branding */}
    <path d="M6 6H14V10H6V6Z" fill="currentColor"/>
  </svg>
);

// --- Utility Components ---

const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <div className="flex justify-between items-end mb-4 px-1">
    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">{title}</h2>
    {onSeeAll && (
      <button onClick={onSeeAll} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
        Ver todo
      </button>
    )}
  </div>
);

const Chip = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
      isActive
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg scale-105'
        : 'glass-panel text-slate-600 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

const MediaCard: React.FC<{ item: MediaItem; onClick: () => void; isLarge?: boolean }> = ({ item, onClick, isLarge = false }) => (
  <div 
    onClick={onClick}
    className={`group relative flex-shrink-0 cursor-pointer transition-transform duration-300 ${isLarge ? 'w-64' : 'w-36'} active:scale-95 snap-start`}
  >
    <div className={`relative overflow-hidden rounded-2xl mb-3 shadow-md dark:shadow-lg ${isLarge ? 'h-64' : 'h-36'}`}>
      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
           <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
             <Play size={16} className="fill-white text-white ml-0.5" />
           </div>
        </div>
      )}
      {item.type === 'pdf' && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
          PDF
        </div>
      )}
    </div>
    <h3 className={`font-semibold text-slate-900 dark:text-white leading-tight truncate font-display ${isLarge ? 'text-lg' : 'text-sm'}`}>{item.title}</h3>
    <p className="text-xs text-slate-500 dark:text-white/50 mt-1 truncate">{item.author}</p>
  </div>
);

// --- New Components ---

const TagBadge: React.FC<{ label: string }> = ({ label }) => (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/70">
        {label}
    </span>
);

const CourseCard: React.FC<{ course: Course; onPlayEpisode: (episode: Episode, course: Course) => void }> = ({ course, onPlayEpisode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-brand-50/50 dark:bg-white/5 border-brand-500/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
            {/* Header / Trigger */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 flex gap-4 cursor-pointer relative"
            >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative">
                    <img src={course.coverUrl} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-1 mb-1.5">
                        {course.tags.slice(0, 2).map((tag, i) => <TagBadge key={i} label={tag} />)}
                    </div>
                    <h3 className="font-bold text-base leading-tight mb-1 text-slate-900 dark:text-white pr-6 font-display">{course.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-white/50">{course.instructor} • {course.episodes.length} episodios</p>
                </div>

                <div className="absolute top-4 right-4 text-slate-400 dark:text-white/30">
                    <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-500' : ''}`} />
                </div>
            </div>

            {/* Expandable Content (Accordion) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 pt-0 space-y-2">
                    <div className="h-[1px] w-full bg-slate-200 dark:bg-white/5 mb-3" />
                    {course.episodes.map((ep, idx) => (
                        <div 
                            key={ep.id} 
                            onClick={(e) => { e.stopPropagation(); onPlayEpisode(ep, course); }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 dark:hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-white/30 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                <Play size={12} className="ml-0.5 fill-current" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-slate-700 dark:text-white/90 leading-tight mb-0.5">{ep.title}</h4>
                                <span className="text-[10px] text-slate-400 dark:text-white/40 font-mono">{ep.duration}</span>
                            </div>
                            {idx === 0 && (
                                <div className="p-1.5 rounded-full bg-green-500/10 dark:bg-green-500/20">
                                    <Check size={12} className="text-green-600 dark:text-green-400" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AudiobookCard: React.FC<{ item: MediaItem; onPlay: () => void }> = ({ item, onPlay }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const chapters = item.chapters || [];

    return (
        <div className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-amber-50/50 dark:bg-white/5 border-amber-500/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 flex gap-4 cursor-pointer relative"
            >
                {/* Portrait Image Ratio for Books */}
                <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-lg relative bg-gray-200 dark:bg-gray-800">
                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                     <div className="absolute bottom-1 right-1">
                         <div className="bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                             <Headphones size={10} className="text-white/80" />
                         </div>
                     </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-1 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Audiobook
                        </span>
                        {chapters.length > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-500 dark:text-white/40">
                                {chapters.length} capítulos
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-base leading-tight mb-1 text-slate-900 dark:text-white pr-6 font-display">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-white/50">{item.author} • {item.duration}</p>
                </div>

                <div className="absolute top-4 right-4 text-slate-400 dark:text-white/30">
                    <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-amber-500' : ''}`} />
                </div>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 pt-0 space-y-2">
                    <div className="h-[1px] w-full bg-slate-200 dark:bg-white/5 mb-3" />
                    <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest pl-1">Tabla de Contenidos</span>
                    </div>
                    {chapters.length > 0 ? chapters.map((chap) => (
                        <div
                            key={chap.id}
                            onClick={(e) => { e.stopPropagation(); onPlay(); }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-white/30 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-black transition-colors">
                                <Play size={12} className="ml-0.5 fill-current" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-slate-700 dark:text-white/90 leading-tight mb-0.5">{chap.title}</h4>
                                {chap.duration && <span className="text-[10px] text-slate-400 dark:text-white/40 font-mono">{chap.duration}</span>}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-4 text-sm text-slate-400 dark:text-white/40">
                            Sin capítulos disponibles
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Google Icon Component ---
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

// --- Login Component ---

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                await authService.signUp({ email, password, name });
            } else {
                await authService.signIn({ email, password });
            }
            setExiting(true);
            setTimeout(() => {
                onLoginSuccess();
            }, 600);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de autenticación');
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        try {
            await authService.signInWithOAuth('google');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al conectar con Google');
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center px-6 transition-all duration-700 ${exiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
             {/* Dynamic Background for Login */}
             <div className="absolute inset-0 bg-slate-50 dark:bg-[#050505] transition-colors duration-500">
                <div className="absolute top-[-20%] left-[-20%] w-[120%] h-[120%] bg-brand-200/40 dark:bg-brand-900/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-purple-200/40 dark:bg-violet-900/10 rounded-full blur-[130px]" />
             </div>

             <div className="w-full max-w-md relative z-10 animate-slide-up">
                 <div className="glass-panel p-8 rounded-3xl border-t border-white/50 dark:border-white/10 shadow-2xl relative overflow-hidden">

                     {/* Decorative light effect inside card */}
                     <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/20 rounded-full blur-[50px]" />

                     {/* Logo & Header */}
                     <div className="flex flex-col items-center mb-8">
                         <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg shadow-brand-500/30 mb-6">
                             <img src="/logo-badge.png" alt="Intelia" className="w-full h-full object-contain" />
                         </div>
                         <p className="text-slate-500 dark:text-white/40 text-sm text-center">Plataforma educativa de ingeniería premium</p>
                     </div>

                     {/* Toggle Tabs */}
                     <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 mb-6">
                         <button
                             type="button"
                             onClick={() => { setIsSignUp(false); setError(null); }}
                             className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                 !isSignUp
                                     ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                                     : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70'
                             }`}
                         >
                             Iniciar sesión
                         </button>
                         <button
                             type="button"
                             onClick={() => { setIsSignUp(true); setError(null); }}
                             className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                 isSignUp
                                     ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                                     : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70'
                             }`}
                         >
                             Registrarse
                         </button>
                     </div>

                     {/* Error Message */}
                     {error && (
                         <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                             {error}
                         </div>
                     )}

                     {/* Form */}
                     <form onSubmit={handleSubmit} className="space-y-4">
                         {/* Name Field - Only for SignUp */}
                         {isSignUp && (
                             <div className="space-y-1.5 animate-fade-in">
                                 <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 ml-1">Nombre</label>
                                 <div className="relative group">
                                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                         <User size={18} className="text-slate-400 dark:text-white/30 group-focus-within:text-brand-500 transition-colors" />
                                     </div>
                                     <input
                                         type="text"
                                         value={name}
                                         onChange={(e) => setName(e.target.value)}
                                         placeholder="Tu nombre completo"
                                         required={isSignUp}
                                         className="w-full pl-11 pr-4 py-4 rounded-xl bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 transition-all font-medium"
                                     />
                                 </div>
                             </div>
                         )}

                         <div className="space-y-1.5">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 ml-1">Email</label>
                             <div className="relative group">
                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                     <Mail size={18} className="text-slate-400 dark:text-white/30 group-focus-within:text-brand-500 transition-colors" />
                                 </div>
                                 <input
                                     type="email"
                                     value={email}
                                     onChange={(e) => setEmail(e.target.value)}
                                     placeholder="ej. usuario@intelia.com"
                                     required
                                     className="w-full pl-11 pr-4 py-4 rounded-xl bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 transition-all font-medium"
                                 />
                             </div>
                         </div>

                         <div className="space-y-1.5">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 ml-1">Contraseña</label>
                             <div className="relative group">
                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                     <Lock size={18} className="text-slate-400 dark:text-white/30 group-focus-within:text-brand-500 transition-colors" />
                                 </div>
                                 <input
                                     type="password"
                                     value={password}
                                     onChange={(e) => setPassword(e.target.value)}
                                     placeholder="••••••••"
                                     required
                                     minLength={6}
                                     className="w-full pl-11 pr-4 py-4 rounded-xl bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 transition-all font-medium"
                                 />
                             </div>
                             {isSignUp && (
                                 <p className="text-xs text-slate-400 dark:text-white/30 ml-1">Mínimo 6 caracteres</p>
                             )}
                         </div>

                         {!isSignUp && (
                             <div className="flex items-center justify-between py-2">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                     <div className="w-4 h-4 rounded border border-slate-300 dark:border-white/20 flex items-center justify-center">
                                         {/* Fake Checkbox */}
                                     </div>
                                     <span className="text-xs text-slate-500 dark:text-white/50">Recordarme</span>
                                 </label>
                                 <button type="button" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                                     ¿Olvidaste tu contraseña?
                                 </button>
                             </div>
                         )}

                         <button
                             type="submit"
                             disabled={isLoading}
                             className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-brand-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70"
                         >
                             {isLoading ? (
                                 <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             ) : (
                                 <>
                                     <span className="relative z-10">{isSignUp ? 'Crear cuenta' : 'Ingresar a Intelia'}</span>
                                     <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                 </>
                             )}
                         </button>
                     </form>

                     {/* Separator */}
                     <div className="relative my-6">
                         <div className="absolute inset-0 flex items-center">
                             <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                         </div>
                         <div className="relative flex justify-center text-xs">
                             <span className="px-4 bg-white dark:bg-[#0a0a0a] text-slate-400 dark:text-white/40">o continúa con</span>
                         </div>
                     </div>

                     {/* OAuth Buttons */}
                     <div className="space-y-3">
                         <button
                             type="button"
                             onClick={handleGoogleLogin}
                             className="w-full py-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-semibold text-sm transition-colors flex items-center justify-center gap-3"
                         >
                             <GoogleIcon />
                             Continuar con Google
                         </button>

                         <button
                             type="button"
                             className="w-full py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                         >
                             <Fingerprint size={18} className="text-slate-400 dark:text-white/50" />
                             Ingresar con Biometría
                         </button>
                     </div>
                 </div>

                 <p className="text-center mt-6 text-xs text-slate-400 dark:text-white/30">
                     {isSignUp
                         ? '¿Ya tienes cuenta? '
                         : '¿No tienes cuenta? '}
                     <span
                         onClick={() => setIsSignUp(!isSignUp)}
                         className="text-brand-600 dark:text-brand-400 font-bold cursor-pointer hover:underline"
                     >
                         {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                     </span>
                 </p>
             </div>
        </div>
    );
};

// --- Main Views ---

const HomeView = ({ onPlay, courses }: { onPlay: (item: MediaItem) => void; courses: Course[] }) => (
  <div className="space-y-8 animate-fade-in">
    {courses.length > 0 ? (
      <>
        <section>
          <SectionHeader title="Continuar estudiando" />
          <div className="flex overflow-x-auto gap-4 px-4 -mx-4 pb-4 no-scrollbar snap-x snap-mandatory touch-pan-x">
            {courses.slice(0, 3).map((course) => {
              // Transform course to MediaItem for the player
              const mediaItem: MediaItem = {
                id: course.id,
                title: course.title,
                author: course.instructor,
                coverUrl: course.coverUrl,
                type: 'podcast',
                duration: course.totalDuration,
                audioUrl: course.episodes[0]?.audioUrl
              };
              return (
                <MediaCard key={course.id} item={mediaItem} onClick={() => onPlay(mediaItem)} isLarge />
              );
            })}
          </div>
        </section>

        <section>
          <SectionHeader title="Rutas de Aprendizaje" />
          <div className="grid grid-cols-2 gap-4">
            {courses.slice(0, 4).map((course) => (
                <div
                    key={course.id}
                    className="glass-card p-3 rounded-2xl flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform hover:shadow-lg"
                    onClick={() => {
                        const mediaItem: MediaItem = {
                            id: course.id,
                            title: course.title,
                            author: course.instructor,
                            coverUrl: course.coverUrl,
                            type: 'podcast',
                            duration: course.totalDuration,
                            audioUrl: course.episodes[0]?.audioUrl
                        };
                        onPlay(mediaItem);
                    }}
                >
                    <div className="aspect-square rounded-xl overflow-hidden relative">
                        <img src={course.coverUrl} className="w-full h-full object-cover" alt="" />
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                            {course.episodes.length} Ep
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm truncate text-slate-900 dark:text-white font-display">{course.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-white/50">{course.instructor}</p>
                    </div>
                </div>
            ))}
          </div>
        </section>
      </>
    ) : (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
          <BookOpen className="text-slate-400 dark:text-white/40" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-white/70 mb-2">Sin contenido disponible</h3>
        <p className="text-sm text-slate-500 dark:text-white/50">El contenido aparecerá aquí cuando esté disponible</p>
      </div>
    )}
  </div>
);

const EngineeringCoursesView = ({ onPlayEpisode, courses }: { onPlayEpisode: (episode: Episode, course: Course) => void; courses: Course[] }) => {
    return (
        <div className="animate-fade-in pb-32">
            <div className="px-1 mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white font-display">Cursos de Ingeniería</h1>
                <p className="text-slate-500 dark:text-white/50 text-sm">Normativas, Calidad, Gestión y Seguridad</p>
            </div>

            {courses.length > 0 ? (
              <div className="flex flex-col gap-4">
                  {courses.map(course => (
                      <CourseCard key={course.id} course={course} onPlayEpisode={onPlayEpisode} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                  <Headphones className="text-slate-400 dark:text-white/40" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-white/70 mb-2">Sin cursos disponibles</h3>
                <p className="text-sm text-slate-500 dark:text-white/50">Los cursos aparecerán aquí cuando estén disponibles</p>
              </div>
            )}
        </div>
    )
}

const AudiobooksView = ({ items, onPlay }: { items: MediaItem[]; onPlay: (item: MediaItem) => void }) => {
    return (
        <div className="animate-fade-in pb-32">
             <div className="px-1 mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white font-display">Audio Libros</h1>
                <p className="text-slate-500 dark:text-white/50 text-sm">Biblioteca técnica y gestión</p>
            </div>
            {items.length > 0 ? (
              <div className="flex flex-col gap-4">
                  {items.map(item => (
                      <AudiobookCard key={item.id} item={item} onPlay={() => onPlay(item)} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                  <Book className="text-slate-400 dark:text-white/40" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-white/70 mb-2">Sin audiolibros disponibles</h3>
                <p className="text-sm text-slate-500 dark:text-white/50">Los audiolibros aparecerán aquí cuando estén disponibles</p>
              </div>
            )}
        </div>
    )
}

const ResourcesView = ({ onPlay, resources }: { onPlay: (item: MediaItem) => void; resources: MediaItem[] }) => {
    const [activeFilter, setActiveFilter] = useState<'all'|'video'|'pdf'>('all');

    const filtered = resources.filter(r => activeFilter === 'all' ? true : r.type === activeFilter);

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 tracking-tight px-1 text-slate-900 dark:text-white font-display">Recursos Técnicos</h1>
            <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
                <Chip label="Todos" isActive={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                <Chip label="Videos" isActive={activeFilter === 'video'} onClick={() => setActiveFilter('video')} />
                <Chip label="Normas PDF" isActive={activeFilter === 'pdf'} onClick={() => setActiveFilter('pdf')} />
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                  {filtered.map(item => (
                      <div key={item.id} onClick={() => onPlay(item)} className="glass-panel p-4 rounded-2xl flex gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-gray-800 flex-shrink-0 relative overflow-hidden">
                               <img src={item.coverUrl} className="w-full h-full object-cover opacity-80 dark:opacity-60" alt="" />
                               <div className="absolute inset-0 flex items-center justify-center">
                                   {item.type === 'video' ? <Play className="fill-white text-white drop-shadow-lg" /> : <FileText className="text-white drop-shadow-lg" />}
                               </div>
                          </div>
                          <div className="flex flex-col justify-center">
                               <div className="flex gap-2 mb-2">
                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.type === 'video' ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                       {item.type}
                                   </span>
                               </div>
                               <h3 className="font-bold text-lg leading-tight mb-1 text-slate-900 dark:text-white font-display">{item.title}</h3>
                               <p className="text-sm text-slate-500 dark:text-white/50">{item.author}</p>
                               <p className="text-xs text-slate-400 dark:text-white/30 mt-2">{item.type === 'video' ? item.duration : `${item.pages} páginas`}</p>
                          </div>
                      </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                  <FolderOpen className="text-slate-400 dark:text-white/40" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-white/70 mb-2">Sin recursos disponibles</h3>
                <p className="text-sm text-slate-500 dark:text-white/50">Los recursos aparecerán aquí cuando estén disponibles</p>
              </div>
            )}
        </div>
    )
}

const LibraryView = () => (
    <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 tracking-tight px-1 text-slate-900 dark:text-white font-display">Mi Progreso</h1>
        
        <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center">
                        <Heart className="text-white fill-white" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">Favoritos</h3>
                        <p className="text-xs text-slate-500 dark:text-white/50">Normas y Capítulos guardados</p>
                    </div>
                </div>
                <ChevronDown className="-rotate-90 text-slate-400 dark:text-white/30" />
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Check className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">Completados</h3>
                        <p className="text-xs text-slate-500 dark:text-white/50">8 cursos finalizados</p>
                    </div>
                </div>
                <ChevronDown className="-rotate-90 text-slate-400 dark:text-white/30" />
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center">
                        <ListMusic className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">Mis Listas</h3>
                        <p className="text-xs text-slate-500 dark:text-white/50">3 listas de estudio</p>
                    </div>
                </div>
                <ChevronDown className="-rotate-90 text-slate-400 dark:text-white/30" />
            </div>
        </div>
    </div>
)

const ProfileView = ({ user, onEditProfile, onLogout, isAdmin, onAdminPanel }: { user: UserData; onEditProfile: () => void; onLogout: () => void; isAdmin?: boolean; onAdminPanel?: () => void }) => {
    return (
        <div className="animate-fade-in">
            {/* Header / Hero */}
            <div className="relative flex flex-col items-center pt-8 pb-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none" />
                
                <div className="relative">
                    <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-brand-400 via-purple-500 to-pink-500">
                        <img
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=6366f1&color=fff&size=128`}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover border-[4px] border-white dark:border-[#050505]"
                        />
                    </div>
                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-white dark:bg-[#050505] rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Zap size={14} className="fill-white text-white" />
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold mt-4 text-slate-900 dark:text-white font-display">{user.name}</h1>
                <p className="text-slate-500 dark:text-white/50 text-sm font-medium mb-2">{user.handle}{user.specialty ? ` • ${user.specialty}` : ''}</p>
                <div className="px-3 py-1 bg-brand-100 dark:bg-white/10 rounded-full border border-brand-200 dark:border-white/10 backdrop-blur-md">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-300 tracking-wide uppercase">Plan Estudiante</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-10 text-slate-900 dark:text-white">
                        <TrendingUp size={48} />
                    </div>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">124</span>
                    <span className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-wider font-bold">Horas Estudio</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-10 text-slate-900 dark:text-white">
                        <Award size={48} />
                    </div>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">12</span>
                    <span className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-wider font-bold">Certificados</span>
                </div>
            </div>

            {/* Menu Sections - Simplified */}
            <h3 className="text-sm font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-4 px-1">Cuenta</h3>
            
            <div className="space-y-2">
                <div onClick={onEditProfile} className="glass-panel p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-[0.99]">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-white/70">
                        <User size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Editar Perfil</h4>
                        <p className="text-xs text-slate-500 dark:text-white/40">Cambiar foto, especialidad</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 dark:text-white/20" />
                </div>

                {/* Admin Panel Button - Only visible to admins */}
                {isAdmin && onAdminPanel && (
                    <div onClick={onAdminPanel} className="glass-panel p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-[0.99] border border-brand-500/30">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white">
                            <Shield size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Panel de Administrador</h4>
                            <p className="text-xs text-slate-500 dark:text-white/40">Gestionar contenido</p>
                        </div>
                        <ChevronRight size={18} className="text-brand-500" />
                    </div>
                )}
            </div>

            <button onClick={onLogout} className="w-full mt-8 py-4 rounded-xl border border-red-500/30 text-red-500 dark:text-red-400 font-semibold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                <LogOut size={18} />
                Cerrar Sesión
            </button>
        </div>
    );
};

const EditProfileView = ({ user, onSave, onCancel }: { user: UserData; onSave: (data: UserData) => void; onCancel: () => void }) => {
    const [name, setName] = useState(user.name);
    const [handle, setHandle] = useState(user.handle);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

    const handleSave = () => {
        onSave({
            ...user,
            name,
            handle,
            avatarUrl
        });
    };

    return (
        <div className="animate-fade-in pt-4 pb-4">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={onCancel} className="p-2 rounded-full glass-panel hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <ChevronDown className="rotate-90 text-slate-600 dark:text-white/70" />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">Editar Perfil</h1>
            </div>

            <div className="flex flex-col items-center mb-10">
                <div className="relative w-32 h-32 mb-4 group cursor-pointer">
                     <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                         <Camera className="text-white" size={32} />
                     </div>
                     <img src={avatarUrl} className="w-full h-full rounded-full object-cover border-4 border-slate-100 dark:border-white/10" alt="" />
                     <button className="absolute bottom-0 right-0 p-2.5 bg-brand-500 rounded-full text-white shadow-lg border-4 border-white dark:border-[#050505] z-20 active:scale-95 transition-transform">
                        <Camera size={16} />
                     </button>
                </div>
                <p className="text-brand-600 dark:text-brand-400 text-sm font-semibold hover:text-brand-500 cursor-pointer">Cambiar foto de perfil</p>
            </div>

            <div className="space-y-6 mb-12">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider ml-1">Nombre Completo</label>
                    <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3 focus-within:border-brand-500/50 focus-within:bg-brand-50/50 dark:focus-within:bg-white/5 transition-all">
                        <User size={18} className="text-slate-400 dark:text-white/40" />
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-white/20 font-medium"
                            placeholder="Tu nombre"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider ml-1">Especialidad / Título</label>
                    <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3 focus-within:border-brand-500/50 focus-within:bg-brand-50/50 dark:focus-within:bg-white/5 transition-all">
                        <span className="text-slate-400 dark:text-white/40 font-bold text-lg">@</span>
                        <input 
                            value={handle.startsWith('@') ? handle.substring(1) : handle}
                            onChange={(e) => setHandle(e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`)}
                            className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-white/20 font-medium"
                            placeholder="usuario"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-brand-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-safe"
            >
                <Check size={20} />
                Guardar Cambios
            </button>
        </div>
    )
}

// =============================================
// ONBOARDING MODALS
// =============================================

const CAREER_OPTIONS = [
  'Ingeniería en Alimentos',
  'Ingeniería Industrial',
  'Ingeniería Química',
  'Nutrición',
  'Gastronomía',
  'Administración',
  'Otro'
];

const CareerSelectionModal = ({
  onSelect,
  onSkip
}: {
  onSelect: (career: string) => void;
  onSkip: () => void;
}) => {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [customCareer, setCustomCareer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedCareer) return;
    setIsLoading(true);
    const careerToSave = selectedCareer === 'Otro' ? customCareer : selectedCareer;
    if (careerToSave) {
      await onSelect(careerToSave);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display text-center">
            ¿Qué carrera estudias?
          </h2>
          <p className="text-slate-500 dark:text-white/50 text-sm text-center mt-2">
            Personaliza tu experiencia de aprendizaje
          </p>
        </div>

        {/* Career Options */}
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {CAREER_OPTIONS.map((career) => (
            <button
              key={career}
              onClick={() => setSelectedCareer(career)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedCareer === career
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <span className="font-medium">{career}</span>
            </button>
          ))}
        </div>

        {/* Custom Input for "Otro" */}
        {selectedCareer === 'Otro' && (
          <div className="mb-6">
            <input
              type="text"
              value={customCareer}
              onChange={(e) => setCustomCareer(e.target.value)}
              placeholder="Escribe tu carrera..."
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinue}
            disabled={!selectedCareer || (selectedCareer === 'Otro' && !customCareer) || isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check size={20} />
                Continuar
              </>
            )}
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3 rounded-xl text-slate-500 dark:text-white/50 font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    </div>
  );
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallModal = ({
  onClose,
  deferredPrompt
}: {
  onClose: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
}) => {
  const [isInstalling, setIsInstalling] = useState(false);

  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onClose();
      }
    } catch (err) {
      console.error('Install error:', err);
    }
    setIsInstalling(false);
  };

  // If already installed, don't show
  if (isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
            <Smartphone size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display text-center">
            Instala Intelia
          </h2>
          <p className="text-slate-500 dark:text-white/50 text-sm text-center mt-2">
            Accede más rápido desde tu pantalla de inicio
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check size={16} className="text-white" />
            </div>
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">Acceso rápido desde tu inicio</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Check size={16} className="text-white" />
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Funciona sin conexión</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
              <Check size={16} className="text-white" />
            </div>
            <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Experiencia como app nativa</span>
          </div>
        </div>

        {/* Platform-specific instructions */}
        {isIOS ? (
          <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <p className="text-sm text-slate-700 dark:text-white/80 font-medium mb-3">
              Para instalar en iPhone/iPad:
            </p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-white/60">
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                Toca el botón <Share size={16} className="inline mx-1" /> Compartir
              </p>
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                Selecciona "Añadir a pantalla de inicio"
              </p>
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                Toca "Añadir" para confirmar
              </p>
            </div>
          </div>
        ) : null}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {!isIOS && deferredPrompt ? (
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold shadow-lg disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download size={20} />
                  Instalar Ahora
                </>
              )}
            </button>
          ) : isIOS ? (
            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Entendido
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-slate-500 dark:text-white/50 font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// ADMIN COMPONENTS
// =============================================

// File Upload Component
const FileUploadButton = ({
  accept,
  onUpload,
  label,
  icon: Icon,
  isUploading
}: {
  accept: string;
  onUpload: (file: File) => void;
  label: string;
  icon: React.ElementType;
  isUploading?: boolean;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white/70 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon size={18} />
        )}
        {label}
      </button>
    </>
  );
};

// Admin Dashboard
const AdminDashboard = ({
  stats,
  onNavigate
}: {
  stats: { totalCourses: number; totalAudiobooks: number; totalResources: number; totalUsers: number } | null;
  onNavigate: (view: ViewState) => void;
}) => {
  const cards = [
    { title: 'Cursos', count: stats?.totalCourses || 0, icon: Headphones, view: 'admin-courses' as ViewState, color: 'from-violet-500 to-purple-600' },
    { title: 'Audiobooks', count: stats?.totalAudiobooks || 0, icon: Book, view: 'admin-audiobooks' as ViewState, color: 'from-blue-500 to-cyan-600' },
    { title: 'Recursos', count: stats?.totalResources || 0, icon: FolderOpen, view: 'admin-resources' as ViewState, color: 'from-emerald-500 to-teal-600' },
    { title: 'Usuarios', count: stats?.totalUsers || 0, icon: User, view: 'admin' as ViewState, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="animate-fade-in pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel Admin</h1>
          <p className="text-sm text-slate-500 dark:text-white/50">Gestionar contenido</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => onNavigate(card.view)}
            className="glass-panel p-5 rounded-2xl text-left hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={20} className="text-white" />
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{card.count}</span>
            <p className="text-sm text-slate-500 dark:text-white/50 font-medium">{card.title}</p>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">Acciones Rápidas</h2>
      <div className="space-y-3">
        <button
          onClick={() => onNavigate('admin-courses')}
          className="w-full glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
            <Plus size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white">Nuevo Curso</h3>
            <p className="text-xs text-slate-500 dark:text-white/40">Agregar curso con episodios</p>
          </div>
          <ChevronRight size={18} className="text-slate-300 dark:text-white/20" />
        </button>

        <button
          onClick={() => onNavigate('admin-audiobooks')}
          className="w-full glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <Plus size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white">Nuevo Audiobook</h3>
            <p className="text-xs text-slate-500 dark:text-white/40">Agregar audiobook con capítulos</p>
          </div>
          <ChevronRight size={18} className="text-slate-300 dark:text-white/20" />
        </button>

        <button
          onClick={() => onNavigate('admin-resources')}
          className="w-full glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <Plus size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white">Nuevo Recurso</h3>
            <p className="text-xs text-slate-500 dark:text-white/40">Subir PDF o video</p>
          </div>
          <ChevronRight size={18} className="text-slate-300 dark:text-white/20" />
        </button>
      </div>
    </div>
  );
};

// Admin Courses View
const AdminCoursesView = ({
  courses,
  onBack,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onCreateEpisode,
  onUpdateEpisode,
  onDeleteEpisode,
  uploadAudio,
  uploadCover
}: {
  courses: any[];
  onBack: () => void;
  onCreateCourse: (input: any) => Promise<any>;
  onUpdateCourse: (id: string, input: any) => Promise<any>;
  onDeleteCourse: (id: string) => Promise<void>;
  onCreateEpisode: (input: any) => Promise<any>;
  onUpdateEpisode: (id: string, input: any) => Promise<any>;
  onDeleteEpisode: (id: string) => Promise<void>;
  uploadAudio: (file: File) => Promise<string>;
  uploadCover: (file: File) => Promise<string>;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [level, setLevel] = useState<'Básico' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [tags, setTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalDuration, setTotalDuration] = useState('');

  // Episode form state
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<any>(null);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeDescription, setEpisodeDescription] = useState('');
  const [episodeDuration, setEpisodeDuration] = useState('');
  const [episodeAudioUrl, setEpisodeAudioUrl] = useState('');

  const resetForm = () => {
    setTitle('');
    setInstructor('');
    setLevel('Intermedio');
    setTags('');
    setCoverUrl('');
    setTotalDuration('');
    setEditingCourse(null);
    setShowForm(false);
  };

  const resetEpisodeForm = () => {
    setEpisodeTitle('');
    setEpisodeDescription('');
    setEpisodeDuration('');
    setEpisodeAudioUrl('');
    setEditingEpisode(null);
    setShowEpisodeForm(false);
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setTitle(course.title);
    setInstructor(course.instructor);
    setLevel(course.level);
    setTags(course.tags?.join(', ') || '');
    setCoverUrl(course.cover_url || '');
    setTotalDuration(course.total_duration || '');
    setShowForm(true);
  };

  const handleSubmitCourse = async () => {
    if (!title || !instructor) {
      setError('Título e instructor son requeridos');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const courseData = {
        title,
        instructor,
        level,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        cover_url: coverUrl || null,
        total_duration: totalDuration || null
      };

      if (editingCourse) {
        await onUpdateCourse(editingCourse.id, courseData);
      } else {
        await onCreateCourse(courseData);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('¿Eliminar este curso y todos sus episodios?')) {
      setIsLoading(true);
      try {
        await onDeleteCourse(id);
        if (selectedCourse?.id === id) setSelectedCourse(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditEpisode = (episode: any) => {
    setEditingEpisode(episode);
    setEpisodeTitle(episode.title);
    setEpisodeDescription(episode.description || '');
    setEpisodeDuration(episode.duration || '');
    setEpisodeAudioUrl(episode.audio_url || '');
    setShowEpisodeForm(true);
  };

  const handleSubmitEpisode = async () => {
    if (!episodeTitle || !selectedCourse) {
      setError('Título es requerido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const episodeData = {
        course_id: selectedCourse.id,
        title: episodeTitle,
        description: episodeDescription || null,
        duration: episodeDuration || null,
        audio_url: episodeAudioUrl || null,
        order_index: editingEpisode?.order_index || (selectedCourse.episodes?.length || 0) + 1
      };

      if (editingEpisode) {
        await onUpdateEpisode(editingEpisode.id, episodeData);
      } else {
        await onCreateEpisode(episodeData);
      }
      resetEpisodeForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (confirm('¿Eliminar este episodio?')) {
      setIsLoading(true);
      try {
        await onDeleteEpisode(id);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUploadCover = async (file: File) => {
    setIsLoading(true);
    try {
      const url = await uploadCover(file);
      setCoverUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadAudio = async (file: File) => {
    setIsLoading(true);
    try {
      const url = await uploadAudio(file);
      setEpisodeAudioUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Episode detail view
  if (selectedCourse) {
    return (
      <div className="animate-fade-in pb-32">
        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-slate-500 dark:text-white/50 mb-4 hover:text-brand-500 transition-colors">
          <ArrowLeft size={18} />
          Volver a cursos
        </button>

        <div className="glass-panel p-4 rounded-2xl mb-6">
          <div className="flex gap-4">
            {selectedCourse.cover_url && (
              <img src={selectedCourse.cover_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
            )}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCourse.title}</h2>
              <p className="text-sm text-slate-500 dark:text-white/50">{selectedCourse.instructor}</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300">
                {selectedCourse.level}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Episodios ({selectedCourse.episodes?.length || 0})</h3>
          <button
            onClick={() => { resetEpisodeForm(); setShowEpisodeForm(true); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Episode Form Modal */}
        {showEpisodeForm && (
          <div className="glass-panel p-4 rounded-2xl mb-6 border-2 border-brand-500/50">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">
              {editingEpisode ? 'Editar Episodio' : 'Nuevo Episodio'}
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Título *</label>
                <input
                  value={episodeTitle}
                  onChange={(e) => setEpisodeTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  placeholder="Título del episodio"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Descripción</label>
                <textarea
                  value={episodeDescription}
                  onChange={(e) => setEpisodeDescription(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white resize-none"
                  placeholder="Descripción del episodio"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Duración</label>
                <input
                  value={episodeDuration}
                  onChange={(e) => setEpisodeDuration(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  placeholder="Ej: 15:30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider mb-2 block">Audio</label>
                <div className="flex items-center gap-3">
                  <FileUploadButton
                    accept="audio/*"
                    onUpload={handleUploadAudio}
                    label="Subir Audio"
                    icon={Music}
                    isUploading={isLoading}
                  />
                  {episodeAudioUrl && <span className="text-xs text-green-500">✓ Audio cargado</span>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmitEpisode}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                  {editingEpisode ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  onClick={resetEpisodeForm}
                  className="px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Episodes List */}
        <div className="space-y-2">
          {selectedCourse.episodes?.sort((a: any, b: any) => a.order_index - b.order_index).map((episode: any, idx: number) => (
            <div key={episode.id} className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-white/60">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 dark:text-white truncate">{episode.title}</h4>
                <p className="text-xs text-slate-500 dark:text-white/40">{episode.duration || 'Sin duración'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEditEpisode(episode)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/50">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDeleteEpisode(episode.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {(!selectedCourse.episodes || selectedCourse.episodes.length === 0) && (
            <p className="text-center text-slate-500 dark:text-white/40 py-8">No hay episodios. Crea el primero.</p>
          )}
        </div>
      </div>
    );
  }

  // Course Form Modal
  if (showForm) {
    return (
      <div className="animate-fade-in pb-32">
        <button onClick={resetForm} className="flex items-center gap-2 text-slate-500 dark:text-white/50 mb-4 hover:text-brand-500 transition-colors">
          <ArrowLeft size={18} />
          Volver
        </button>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-brand-500 outline-none"
              placeholder="Título del curso"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Instructor *</label>
            <input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-brand-500 outline-none"
              placeholder="Nombre del instructor"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Nivel</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Tags (separados por coma)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-brand-500 outline-none"
              placeholder="ISO 9001, Calidad, Six Sigma"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider">Duración Total</label>
            <input
              value={totalDuration}
              onChange={(e) => setTotalDuration(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-brand-500 outline-none"
              placeholder="Ej: 2h 30min"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-wider mb-2 block">Portada</label>
            <div className="flex items-center gap-4">
              <FileUploadButton
                accept="image/*"
                onUpload={handleUploadCover}
                label="Subir Imagen"
                icon={Image}
                isUploading={isLoading}
              />
              {coverUrl && (
                <img src={coverUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
              )}
            </div>
          </div>

          <button
            onClick={handleSubmitCourse}
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold hover:from-brand-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {editingCourse ? 'Actualizar Curso' : 'Crear Curso'}
          </button>
        </div>
      </div>
    );
  }

  // Courses List
  return (
    <div className="animate-fade-in pb-32">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 dark:text-white/50 mb-4 hover:text-brand-500 transition-colors">
        <ArrowLeft size={18} />
        Volver al panel
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cursos ({courses.length})</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus size={18} />
          Nuevo
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.id} className="glass-panel p-4 rounded-2xl">
            <div className="flex gap-4">
              {course.cover_url ? (
                <img src={course.cover_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center">
                  <Headphones size={24} className="text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{course.title}</h3>
                <p className="text-sm text-slate-500 dark:text-white/50">{course.instructor}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60">
                    {course.level}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-white/30">
                    {course.episodes?.length || 0} episodios
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={() => setSelectedCourse(course)}
                className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/70 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                Ver Episodios
              </button>
              <button
                onClick={() => handleEditCourse(course)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/50"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={() => handleDeleteCourse(course.id)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="text-center py-12">
            <Headphones size={48} className="mx-auto text-slate-300 dark:text-white/20 mb-4" />
            <p className="text-slate-500 dark:text-white/40">No hay cursos. Crea el primero.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Audiobooks View (simplified - similar pattern to courses)
const AdminAudiobooksView = ({
  audiobooks,
  onBack,
  onCreateAudiobook,
  onUpdateAudiobook,
  onDeleteAudiobook,
  onCreateChapter,
  onUpdateChapter,
  onDeleteChapter,
  uploadAudio,
  uploadCover
}: {
  audiobooks: any[];
  onBack: () => void;
  onCreateAudiobook: (input: any) => Promise<any>;
  onUpdateAudiobook: (id: string, input: any) => Promise<any>;
  onDeleteAudiobook: (id: string) => Promise<void>;
  onCreateChapter: (input: any) => Promise<any>;
  onUpdateChapter: (id: string, input: any) => Promise<any>;
  onDeleteChapter: (id: string) => Promise<void>;
  uploadAudio: (file: File) => Promise<string>;
  uploadCover: (file: File) => Promise<string>;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAudiobook, setEditingAudiobook] = useState<any>(null);
  const [selectedAudiobook, setSelectedAudiobook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalDuration, setTotalDuration] = useState('');

  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDuration, setChapterDuration] = useState('');
  const [chapterAudioUrl, setChapterAudioUrl] = useState('');

  const resetForm = () => {
    setTitle(''); setAuthor(''); setCoverUrl(''); setTotalDuration('');
    setEditingAudiobook(null); setShowForm(false);
  };

  const resetChapterForm = () => {
    setChapterTitle(''); setChapterDuration(''); setChapterAudioUrl('');
    setEditingChapter(null); setShowChapterForm(false);
  };

  const handleSubmitAudiobook = async () => {
    if (!title || !author) { setError('Título y autor son requeridos'); return; }
    setIsLoading(true); setError(null);
    try {
      const data = { title, author, cover_url: coverUrl || null, total_duration: totalDuration || null };
      if (editingAudiobook) await onUpdateAudiobook(editingAudiobook.id, data);
      else await onCreateAudiobook(data);
      resetForm();
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleSubmitChapter = async () => {
    if (!chapterTitle || !selectedAudiobook) { setError('Título es requerido'); return; }
    setIsLoading(true); setError(null);
    try {
      const data = {
        audiobook_id: selectedAudiobook.id,
        title: chapterTitle,
        duration: chapterDuration || null,
        audio_url: chapterAudioUrl || null,
        order_index: editingChapter?.order_index || (selectedAudiobook.chapters?.length || 0) + 1
      };
      if (editingChapter) await onUpdateChapter(editingChapter.id, data);
      else await onCreateChapter(data);
      resetChapterForm();
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleUploadCover = async (file: File) => {
    setIsLoading(true);
    try { setCoverUrl(await uploadCover(file)); }
    catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleUploadAudio = async (file: File) => {
    setIsLoading(true);
    try { setChapterAudioUrl(await uploadAudio(file)); }
    catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  // Similar structure to AdminCoursesView
  if (selectedAudiobook) {
    return (
      <div className="animate-fade-in pb-32">
        <button onClick={() => setSelectedAudiobook(null)} className="flex items-center gap-2 text-slate-500 dark:text-white/50 mb-4">
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="glass-panel p-4 rounded-2xl mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedAudiobook.title}</h2>
          <p className="text-sm text-slate-500 dark:text-white/50">{selectedAudiobook.author}</p>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Capítulos</h3>
          <button onClick={() => { resetChapterForm(); setShowChapterForm(true); }} className="px-3 py-2 rounded-lg bg-brand-500 text-white text-sm">
            <Plus size={16} className="inline mr-1" /> Nuevo
          </button>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 text-sm">{error}</div>}
        {showChapterForm && (
          <div className="glass-panel p-4 rounded-2xl mb-4 border-2 border-brand-500/50">
            <input value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Título del capítulo" className="w-full mb-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
            <input value={chapterDuration} onChange={(e) => setChapterDuration(e.target.value)} placeholder="Duración (ej: 45:00)" className="w-full mb-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
            <div className="flex items-center gap-3 mb-3">
              <FileUploadButton accept="audio/*" onUpload={handleUploadAudio} label="Subir Audio" icon={Music} isUploading={isLoading} />
              {chapterAudioUrl && <span className="text-xs text-green-500">✓ Audio</span>}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmitChapter} disabled={isLoading} className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-semibold">{editingChapter ? 'Actualizar' : 'Crear'}</button>
              <button onClick={resetChapterForm} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60">Cancelar</button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {selectedAudiobook.chapters?.sort((a: any, b: any) => a.order_index - b.order_index).map((ch: any, idx: number) => (
            <div key={ch.id} className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold">{idx + 1}</div>
              <div className="flex-1"><h4 className="font-medium text-slate-900 dark:text-white">{ch.title}</h4><p className="text-xs text-slate-500">{ch.duration || '-'}</p></div>
              <button onClick={() => { setEditingChapter(ch); setChapterTitle(ch.title); setChapterDuration(ch.duration || ''); setChapterAudioUrl(ch.audio_url || ''); setShowChapterForm(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><Edit3 size={16} /></button>
              <button onClick={() => { if (confirm('¿Eliminar?')) onDeleteChapter(ch.id); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="animate-fade-in pb-32">
        <button onClick={resetForm} className="flex items-center gap-2 text-slate-500 mb-4"><ArrowLeft size={18} /> Volver</button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{editingAudiobook ? 'Editar' : 'Nuevo'} Audiobook</h2>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">{error}</div>}
        <div className="space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título *" className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Autor *" className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
          <input value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} placeholder="Duración total (ej: 8h)" className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
          <div className="flex items-center gap-4">
            <FileUploadButton accept="image/*" onUpload={handleUploadCover} label="Portada" icon={Image} isUploading={isLoading} />
            {coverUrl && <img src={coverUrl} className="w-16 h-16 rounded-lg object-cover" />}
          </div>
          <button onClick={handleSubmitAudiobook} disabled={isLoading} className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold mt-4">{editingAudiobook ? 'Actualizar' : 'Crear'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-32">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-4"><ArrowLeft size={18} /> Volver</button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audiobooks ({audiobooks.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-xl bg-brand-500 text-white"><Plus size={18} className="inline mr-1" /> Nuevo</button>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">{error}</div>}
      <div className="space-y-3">
        {audiobooks.map((ab) => (
          <div key={ab.id} className="glass-panel p-4 rounded-2xl">
            <div className="flex gap-4">
              {ab.cover_url ? <img src={ab.cover_url} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center"><Book size={24} className="text-white" /></div>}
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">{ab.title}</h3>
                <p className="text-sm text-slate-500">{ab.author}</p>
                <span className="text-xs text-slate-400">{ab.chapters?.length || 0} capítulos</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => setSelectedAudiobook(ab)} className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-sm">Ver Capítulos</button>
              <button onClick={() => { setEditingAudiobook(ab); setTitle(ab.title); setAuthor(ab.author); setCoverUrl(ab.cover_url || ''); setTotalDuration(ab.total_duration || ''); setShowForm(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><Edit3 size={18} /></button>
              <button onClick={() => { if (confirm('¿Eliminar?')) onDeleteAudiobook(ab.id); }} className="p-2 hover:bg-red-100 text-red-500 rounded-lg"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {audiobooks.length === 0 && <p className="text-center py-12 text-slate-500">No hay audiobooks.</p>}
      </div>
    </div>
  );
};

// Admin Resources View
const AdminResourcesView = ({
  resources,
  onBack,
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
  uploadVideo,
  uploadPDF,
  uploadCover
}: {
  resources: any[];
  onBack: () => void;
  onCreateResource: (input: any) => Promise<any>;
  onUpdateResource: (id: string, input: any) => Promise<any>;
  onDeleteResource: (id: string) => Promise<void>;
  uploadVideo: (file: File) => Promise<string>;
  uploadPDF: (file: File) => Promise<string>;
  uploadCover: (file: File) => Promise<string>;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<'pdf' | 'video'>('pdf');
  const [coverUrl, setCoverUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [pages, setPages] = useState('');
  const [duration, setDuration] = useState('');

  const resetForm = () => {
    setTitle(''); setAuthor(''); setType('pdf'); setCoverUrl(''); setFileUrl(''); setPages(''); setDuration('');
    setEditingResource(null); setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!title) { setError('Título es requerido'); return; }
    setIsLoading(true); setError(null);
    try {
      const data = {
        title, author: author || null, type, cover_url: coverUrl || null, file_url: fileUrl || null,
        pages: type === 'pdf' && pages ? parseInt(pages) : null,
        duration: type === 'video' ? duration || null : null
      };
      if (editingResource) await onUpdateResource(editingResource.id, data);
      else await onCreateResource(data);
      resetForm();
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleUploadFile = async (file: File) => {
    setIsLoading(true);
    try {
      const url = type === 'pdf' ? await uploadPDF(file) : await uploadVideo(file);
      setFileUrl(url);
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleUploadCover = async (file: File) => {
    setIsLoading(true);
    try { setCoverUrl(await uploadCover(file)); }
    catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  if (showForm) {
    return (
      <div className="animate-fade-in pb-32">
        <button onClick={resetForm} className="flex items-center gap-2 text-slate-500 mb-4"><ArrowLeft size={18} /> Volver</button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{editingResource ? 'Editar' : 'Nuevo'} Recurso</h2>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
            <div className="flex gap-3">
              <button onClick={() => setType('pdf')} className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-colors ${type === 'pdf' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/20 text-brand-600' : 'border-slate-200 dark:border-white/10'}`}>
                <FileText size={20} className="inline mr-2" /> PDF
              </button>
              <button onClick={() => setType('video')} className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-colors ${type === 'video' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/20 text-brand-600' : 'border-slate-200 dark:border-white/10'}`}>
                <Film size={20} className="inline mr-2" /> Video
              </button>
            </div>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título *" className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Autor" className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
          {type === 'pdf' && <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Páginas" type="number" className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />}
          {type === 'video' && <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duración (ej: 15:30)" className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Archivo</label>
            <div className="flex items-center gap-3">
              <FileUploadButton accept={type === 'pdf' ? 'application/pdf' : 'video/*'} onUpload={handleUploadFile} label={type === 'pdf' ? 'Subir PDF' : 'Subir Video'} icon={type === 'pdf' ? FileUp : Film} isUploading={isLoading} />
              {fileUrl && <span className="text-xs text-green-500">✓ Archivo cargado</span>}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Portada</label>
            <div className="flex items-center gap-4">
              <FileUploadButton accept="image/*" onUpload={handleUploadCover} label="Subir Imagen" icon={Image} isUploading={isLoading} />
              {coverUrl && <img src={coverUrl} className="w-16 h-16 rounded-lg object-cover" />}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={isLoading} className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold mt-4">{editingResource ? 'Actualizar' : 'Crear'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-32">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-4"><ArrowLeft size={18} /> Volver</button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recursos ({resources.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-xl bg-brand-500 text-white"><Plus size={18} className="inline mr-1" /> Nuevo</button>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">{error}</div>}
      <div className="space-y-3">
        {resources.map((res) => (
          <div key={res.id} className="glass-panel p-4 rounded-2xl flex gap-4">
            {res.cover_url ? <img src={res.cover_url} className="w-16 h-16 rounded-xl object-cover" /> : <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${res.type === 'pdf' ? 'bg-gradient-to-br from-red-400 to-orange-500' : 'bg-gradient-to-br from-purple-400 to-pink-500'}`}>{res.type === 'pdf' ? <FileText size={24} className="text-white" /> : <Film size={24} className="text-white" />}</div>}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">{res.title}</h3>
              <p className="text-sm text-slate-500">{res.author || 'Sin autor'}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10">{res.type.toUpperCase()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => { setEditingResource(res); setTitle(res.title); setAuthor(res.author || ''); setType(res.type); setCoverUrl(res.cover_url || ''); setFileUrl(res.file_url || ''); setPages(res.pages?.toString() || ''); setDuration(res.duration || ''); setShowForm(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><Edit3 size={16} /></button>
              <button onClick={() => { if (confirm('¿Eliminar?')) onDeleteResource(res.id); }} className="p-2 hover:bg-red-100 text-red-500 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {resources.length === 0 && <p className="text-center py-12 text-slate-500">No hay recursos.</p>}
      </div>
    </div>
  );
};

// --- Player Component (Updated with Study Mode) ---

const Player = ({
  state,
  onClose,
  onTogglePlay,
  onExpand,
  onToggleStudyMode,
  onTimeUpdate
}: {
  state: PlayerState;
  onClose: () => void;
  onTogglePlay: () => void;
  onExpand: (expanded: boolean) => void;
  onToggleStudyMode: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}) => {
  const [progress, setProgress] = useState(0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isLiked, setIsLiked] = useState(state.item?.isFavorite || false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(0);
  const [durationDisplay, setDurationDisplay] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio element ref for real playback
  const audioRef = useRef<HTMLAudioElement>(null);
  // Track current audio URL to prevent race conditions on rapid track switching
  const currentAudioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setIsLiked(state.item?.isFavorite || false);
  }, [state.item]);

  // Control audio play/pause based on state - only when audio is ready
  useEffect(() => {
    if (audioRef.current && isAudioReady) {
      if (state.isPlaying) {
        audioRef.current.play().catch(err => console.error('Audio play error:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [state.isPlaying, isAudioReady]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Load new audio when item changes
  useEffect(() => {
    if (audioRef.current && state.item?.audioUrl) {
      // Update ref to track current audio - prevents race conditions
      currentAudioUrlRef.current = state.item.audioUrl;
      setIsAudioReady(false);  // Mark as not ready until onCanPlay fires
      setAudioError(null);     // Clear any previous errors
      audioRef.current.src = state.item.audioUrl;
      audioRef.current.load();
      setProgress(0);
      setCurrentTimeDisplay(0);
    }
  }, [state.item?.audioUrl]);

  const handleLike = () => {
    if (!isLikeAnimating) {
        setIsLikeAnimating(true);
        setIsLiked(!isLiked);
        setTimeout(() => setIsLikeAnimating(false), 400);
    }
  };

  const cycleSpeed = () => {
      const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
      const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
      setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const clickPercent = Math.max(0, Math.min(1, x / width));

      if (audioRef.current && durationDisplay > 0) {
        const newTime = clickPercent * durationDisplay;
        audioRef.current.currentTime = newTime;
        setProgress(clickPercent * 100);
        setCurrentTimeDisplay(newTime);
      }
  };

  // Handle audio time updates
  const handleAudioTimeUpdate = () => {
    if (audioRef.current && audioRef.current.src === currentAudioUrlRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      setCurrentTimeDisplay(current);
      setDurationDisplay(duration);
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
      onTimeUpdate?.(current, duration);
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    // Only handle if this is still the current track
    if (audioRef.current?.src !== currentAudioUrlRef.current) return;
    setProgress(0);
    setCurrentTimeDisplay(0);
    onTogglePlay(); // Stop playing
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state.item) return null;

  // Single return with audio element that persists across view changes
  return (
    <>
      {/* Hidden Audio Element - ALWAYS mounted to maintain playback */}
      {state.item?.audioUrl && (
        <audio
          ref={audioRef}
          src={state.item.audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.src === currentAudioUrlRef.current) {
              setDurationDisplay(audioRef.current.duration);
            }
          }}
          onLoadStart={() => {
            setAudioError(null); // Clear error when starting to load new track
          }}
          onCanPlay={() => {
            // Only process if this is still the current track
            if (audioRef.current?.src !== currentAudioUrlRef.current) return;
            setIsAudioReady(true);
            setAudioError(null); // Clear any previous error
            // Auto-play if state indicates it should be playing
            if (state.isPlaying && audioRef.current) {
              audioRef.current.play().catch(err => console.error('Audio play error:', err));
            }
          }}
          onError={(e) => {
            const audio = e.currentTarget;
            // Ignore errors from previous tracks (race condition)
            if (audio.src !== currentAudioUrlRef.current) return;
            // Ignore abort errors when switching tracks (code 1)
            const errorCode = audio.error?.code || 0;
            if (errorCode === 1) return; // MEDIA_ERR_ABORTED - normal when switching

            const errorMessages: Record<number, string> = {
              2: 'Error de red al cargar audio',
              3: 'Error al decodificar audio',
              4: 'Formato de audio no soportado'
            };
            const message = errorMessages[errorCode] || 'Error al reproducir audio';
            console.error('Audio error:', audio.error);
            setAudioError(message);
            setIsAudioReady(false);
            onPause(); // Stop playing state
          }}
          onEnded={handleAudioEnded}
          preload="auto"
          style={{ display: 'none' }}
        />
      )}

      {/* Full Screen Player */}
      {state.isExpanded ? (
        <div className="fixed inset-0 z-[55] flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white animate-slide-up h-dvh w-screen">
          {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img 
                src={state.item.coverUrl} 
                className="w-full h-full object-cover opacity-10 dark:opacity-20 blur-[80px] scale-150 animate-pulse-slow" 
                alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/60 to-white dark:from-black/20 dark:via-[#050505]/60 dark:to-[#050505]" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex-none flex items-center justify-between px-6 pt-safe mt-4 mb-2">
          <button onClick={() => onExpand(false)} className="p-2 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-full hover:bg-black/10 dark:hover:bg-white/20 active:scale-90 transition-transform text-slate-700 dark:text-white">
            <ChevronDown size={24} />
          </button>
          <span className="text-xs font-bold tracking-widest uppercase opacity-70 font-display">
              {state.isStudyMode ? 'MODO ESTUDIO' : 'REPRODUCIENDO'}
          </span>
          <button className="p-2 text-slate-700 dark:text-white/70 hover:text-black dark:hover:text-white active:scale-90 transition-transform">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col px-6 min-h-0 w-full max-w-lg mx-auto transition-all duration-500">
           
           {/* Idea 4: Study Mode Toggle & Content */}
           <div className={`transition-all duration-500 ease-in-out ${state.isStudyMode ? 'flex-1 overflow-hidden' : 'flex-none h-0 opacity-0 overflow-hidden'}`}>
                {/* Study Resources Panel */}
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl h-full flex flex-col p-6 mb-4 relative overflow-hidden shadow-lg dark:shadow-none">
                    {/* Explicit Close Button for Study Section */}
                    <div className="absolute top-4 right-4 z-20">
                        <button 
                            onClick={onToggleStudyMode}
                            className="p-2 bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 rounded-full text-slate-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors backdrop-blur-md"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex gap-4 mb-6 border-b border-black/5 dark:border-white/10 pb-4 pr-12">
                        <button className="text-sm font-bold text-slate-900 dark:text-white border-b-2 border-brand-500 pb-4 -mb-4.5">Resumen</button>
                        <button className="text-sm font-bold text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white pb-4">Recursos (2)</button>
                        <button className="text-sm font-bold text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white pb-4">Mis Notas</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                        <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 p-4 rounded-xl">
                            <h4 className="font-bold text-brand-600 dark:text-brand-300 text-sm mb-2 flex items-center gap-2">
                                <Zap size={14} /> Puntos Clave
                            </h4>
                            <ul className="text-sm text-slate-700 dark:text-white/80 space-y-2 list-disc pl-4">
                                <li>Importancia de los POES en la industria alimentaria.</li>
                                <li>Diferencia crítica entre limpieza y desinfección.</li>
                                <li>Normativa vigente ISO 22000 aplicada.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Material Adjunto</h4>
                            <div className="flex items-center gap-3 p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer">
                                <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg text-red-500 dark:text-red-400">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Norma_ISO_22000.pdf</p>
                                    <p className="text-xs text-slate-500 dark:text-white/40">2.4 MB</p>
                                </div>
                                <Download size={18} className="text-slate-400 dark:text-white/40" />
                            </div>
                        </div>
                    </div>
                </div>
           </div>
           
           {/* Album Art (Shrinks in Study Mode) */}
           <div className={`w-full aspect-square relative group shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${state.isStudyMode ? 'h-0 opacity-0 mb-0' : 'max-h-[40vh] mb-6 opacity-100'}`}>
              <div className={`absolute inset-0 rounded-[2rem] bg-brand-500/30 blur-2xl transition-all duration-1000 ${state.isPlaying ? 'scale-110 opacity-100' : 'scale-90 opacity-50'}`} />
              <img 
                src={state.item.coverUrl} 
                className={`w-full h-full object-cover rounded-[2rem] shadow-2xl relative z-10 transition-transform duration-700 ease-out ${state.isPlaying ? 'scale-100' : 'scale-[0.95]'}`} 
                alt={state.item.title} 
              />
           </div>

           {/* Info Container */}
           <div className="w-full flex flex-col gap-4 pb-safe flex-none">
               {/* Title */}
               <div className="w-full flex items-center justify-between">
                    <div className="flex-1 pr-4 min-w-0">
                       {state.item.courseTitle && <span className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1 block uppercase tracking-wider">{state.item.courseTitle}</span>}
                       <h2 className="text-xl md:text-2xl font-bold leading-tight mb-1 truncate text-slate-900 dark:text-white font-display">{state.item.title}</h2>
                       <p className="text-sm text-slate-500 dark:text-white/60 font-medium truncate">{state.item.author}</p>
                    </div>
                    
                    {/* Study Mode Toggle Button (Only shows if NOT in study mode to avoid clutter, since we have close button now) */}
                    {!state.isStudyMode && (
                        <button 
                            onClick={onToggleStudyMode}
                            className="p-3 rounded-xl transition-all duration-300 bg-black/5 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/20 active:scale-90"
                        >
                           <Book size={20} />
                        </button>
                    )}
               </div>

               {/* Waveform Progress */}
               <div className="w-full">
                    <div 
                        className="flex items-center justify-between h-8 gap-[3px] cursor-pointer group"
                        onClick={handleProgressClick}
                    >
                        {[...Array(35)].map((_, i) => {
                            const barPosition = (i / 35) * 100;
                            const isActive = barPosition <= progress;
                            // Make waveform smaller in study mode
                            const heightMultiplier = state.isStudyMode ? 0.6 : 1; 
                            const baseHeight = (30 + Math.sin(i * 0.5) * 20 + Math.cos(i * 0.2) * 20 + (Math.random() * 20)) * heightMultiplier;
                            
                            return (
                                <div 
                                    key={i}
                                    className={`w-1.5 md:w-2 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'bg-slate-300 dark:bg-white/10 group-hover:bg-slate-400 dark:group-hover:bg-white/20'}`}
                                    style={{ 
                                        height: `${Math.max(10, Math.min(100, baseHeight))}%`,
                                        animation: (isActive && state.isPlaying) 
                                            ? `wave-dance 1.2s ease-in-out infinite ${i * 0.05}s` 
                                            : 'none'
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium text-slate-400 dark:text-white/40 font-mono tracking-wider">
                        <span>{formatTime(currentTimeDisplay)}</span>
                        <span>{state.item.duration || formatTime(durationDisplay)}</span>
                    </div>
               </div>

               {/* Controls */}
               <div className="flex items-center justify-between w-full px-2">
                  {/* Speed Control */}
                  <button 
                    onClick={cycleSpeed}
                    className="w-10 flex flex-col items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-90"
                  >
                      <span className="text-[10px] font-bold border border-slate-300 dark:border-white/20 rounded px-1.5 py-0.5 bg-slate-100 dark:bg-white/5">
                        {playbackSpeed}x
                      </span>
                  </button>
                  
                  <div className="flex items-center gap-6">
                    <button className="text-slate-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors active:scale-90">
                        <RotateCcw size={26} strokeWidth={1.5} fill="currentColor" fillOpacity={0.1} />
                    </button>
                    
                    <button 
                        onClick={onTogglePlay}
                        className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-90 transition-all duration-200 shadow-xl"
                    >
                        {state.isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>
                    
                    <button className="text-slate-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors active:scale-90">
                        <RotateCw size={26} strokeWidth={1.5} fill="currentColor" fillOpacity={0.1} />
                    </button>
                  </div>
                  
                  <button onClick={handleLike} className={`transition-colors active:scale-90 ${isLiked ? 'text-brand-500' : 'text-slate-400 dark:text-white/40'}`}>
                      <Heart size={22} className={isLiked ? 'fill-current' : ''} />
                  </button>
               </div>
           </div>
        </div>
      </div>
      ) : (
        /* Mini Player */
        <div
          onClick={() => onExpand(true)}
          className="fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] left-4 right-4 h-16 glass-card rounded-2xl flex items-center justify-between px-2 pr-4 z-[45] cursor-pointer shadow-xl animate-slide-up bg-white/90 dark:bg-[#101010]/80 border-t border-slate-200 dark:border-white/10"
        >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-12 h-12 rounded-xl overflow-hidden relative ${state.isPlaying ? 'animate-spin-slow' : ''}`}>
            <img src={state.item.coverUrl} className="w-full h-full object-cover" alt="" />
           <div className="absolute inset-0 bg-black/10 dark:bg-black/20 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-xl" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2 font-display">{state.item.title}</span>
          <span className="text-xs text-brand-600 dark:text-brand-300 truncate">{state.item.author}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <button 
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className={`text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white active:scale-75 transition-transform ${isLiked ? 'text-brand-500 dark:text-brand-400' : ''}`}
         >
            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
         </button>
         <button 
            onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
            className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-slate-700 dark:hover:bg-gray-200 transition-colors shadow-lg active:scale-90"
         >
            {state.isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
         </button>
        </div>

        {/* Background Progress Bar for mini player */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}
    </>
  );
};


// --- Admin Login Screen ---

const AdminLoginScreen = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Ingresa email y contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Sign in with email/password - pasar OBJETO, no argumentos separados
      await authService.signIn({ email, password });

      // 2. Verify user is admin
      const isUserAdmin = await adminService.isAdmin();
      if (!isUserAdmin) {
        await authService.signOut();
        setError('No tienes permisos de administrador');
        setLoading(false);
        return;
      }

      onLoginSuccess();
    } catch (err) {
      // El error se captura aquí si las credenciales son inválidas
      console.error('Admin login error:', err);
      setError('Credenciales inválidas o error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-brand-950 to-purple-950 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-brand-500/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Panel de Administrador</h1>
          <p className="text-white/50 text-sm">Ingresa tus credenciales de admin</p>
        </div>

        {/* Login form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Email</label>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3 focus-within:border-brand-500/50 transition-all">
                <Mail size={18} className="text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-transparent border-none outline-none text-white w-full placeholder-white/20 font-medium"
                  placeholder="admin@intelia.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3 focus-within:border-brand-500/50 transition-all">
                <Lock size={18} className="text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-transparent border-none outline-none text-white w-full placeholder-white/20 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-brand-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight size={18} />
                  Ingresar
                </>
              )}
            </button>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            Acceso restringido a administradores
          </p>
        </div>
      </div>
    </div>
  );
};


// --- Admin App (Wrapper for admin views) ---

const AdminAppWrapper = () => {
  const [view, setView] = useState<ViewState>('admin');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
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
    uploadCover
  } = useAdmin();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await authService.signOut();
    window.location.href = '/';
  };

  return (
    <div className="relative min-h-dvh w-full bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white overflow-auto selection:bg-brand-500/30 transition-colors duration-500">
      {/* Background effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-200/50 dark:bg-brand-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-200/50 dark:bg-violet-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#050505]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white">Admin Panel</h1>
              <p className="text-xs text-slate-500 dark:text-white/40">Intelia</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-medium transition-colors"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-safe">
        {view === 'admin' && <AdminDashboard stats={stats} onNavigate={setView} />}
        {view === 'admin-courses' && (
          <AdminCoursesView
            courses={courses}
            onBack={() => setView('admin')}
            onCreateCourse={createCourse}
            onUpdateCourse={updateCourse}
            onDeleteCourse={deleteCourse}
            onCreateEpisode={createEpisode}
            onUpdateEpisode={updateEpisode}
            onDeleteEpisode={deleteEpisode}
            uploadAudio={uploadAudio}
            uploadCover={uploadCover}
          />
        )}
        {view === 'admin-audiobooks' && (
          <AdminAudiobooksView
            audiobooks={audiobooks}
            onBack={() => setView('admin')}
            onCreateAudiobook={createAudiobook}
            onUpdateAudiobook={updateAudiobook}
            onDeleteAudiobook={deleteAudiobook}
            onCreateChapter={createChapter}
            onUpdateChapter={updateChapter}
            onDeleteChapter={deleteChapter}
            uploadAudio={uploadAudio}
            uploadCover={uploadCover}
          />
        )}
        {view === 'admin-resources' && (
          <AdminResourcesView
            resources={resources}
            onBack={() => setView('admin')}
            onCreateResource={createResource}
            onUpdateResource={updateResource}
            onDeleteResource={deleteResource}
            uploadVideo={uploadVideo}
            uploadPDF={uploadPDF}
            uploadCover={uploadCover}
          />
        )}
      </main>
    </div>
  );
};


// --- App Layout & Logic ---

export default function App() {
  // Admin route detection (path-based: /admin)
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.pathname === '/admin'
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<ViewState>('home');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Content state for regular users (from Supabase)
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [userAudiobooks, setUserAudiobooks] = useState<MediaItem[]>([]);
  const [userResources, setUserResources] = useState<MediaItem[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  // Onboarding modals state
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showPWAModal, setShowPWAModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Listen for path changes (popstate)
  useEffect(() => {
    const handlePathChange = () => {
      setIsAdminRoute(window.location.pathname === '/admin');
    };
    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, []);

  // PWA Install prompt listener
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Admin hook
  const {
    isAdmin,
    loading: adminLoading,
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
    uploadCover
  } = useAdmin();

  // Helper function to extract user data from session and fetch profile
  const updateUserFromSession = async (session: { user: { id: string; user_metadata: Record<string, string>; email?: string; created_at: string } } | null, isNewLogin = false) => {
    if (session?.user) {
      const metadata = session.user.user_metadata;
      setCurrentUserId(session.user.id);

      // Try to get profile from database to get specialty
      let specialty: string | undefined;
      try {
        const profile = await authService.getProfile(session.user.id);
        if (profile) {
          specialty = profile.specialty || undefined;
          // If it's a new login and user has no specialty, show career modal
          if (isNewLogin && !profile.specialty) {
            setShowCareerModal(true);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }

      setUser({
        name: metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'Usuario',
        handle: metadata.email || session.user.email || '',
        avatarUrl: metadata.avatar_url || metadata.picture || '',
        memberSince: new Date(session.user.created_at).getFullYear().toString(),
        specialty
      });
    }
  };

  // Check for existing session and listen for auth changes (OAuth redirect)
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      updateUserFromSession(session, false); // Not a new login on page load
      setAuthLoading(false);
    });

    // Listen for auth state changes (important for OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isNewLogin = event === 'SIGNED_IN';
        setIsAuthenticated(!!session);
        updateUserFromSession(session, isNewLogin);
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load content from Supabase - extracted for retry functionality
  const loadUserContent = async () => {
    if (!isAuthenticated) {
      setContentLoading(false);
      return;
    }

    try {
      setContentLoading(true);
      setContentError(null); // Clear previous errors
      const [coursesData, audiobooksData, resourcesData] = await Promise.all([
        coursesService.getAll(),
        audiobooksService.getAll(),
        resourcesService.getAll()
      ]);

      // Transform to UI format
      setUserCourses((coursesData || []).map(transformCourseToUIFormat));
      setUserAudiobooks((audiobooksData || []).map(transformAudiobookToMediaItem));
      setUserResources((resourcesData || []).map(transformResourceToMediaItem));
    } catch (err) {
      console.error('Error loading content:', err);
      setContentError('Error al cargar contenido. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setContentLoading(false);
    }
  };

  // Load content when authenticated
  useEffect(() => {
    loadUserContent();
  }, [isAuthenticated]);

  const [user, setUser] = useState<UserData>({
    name: '',
    handle: '',
    avatarUrl: '',
    memberSince: new Date().getFullYear().toString()
  });

  const [playerState, setPlayerState] = useState<PlayerState>({
    item: null,
    isPlaying: false,
    isExpanded: false,
    currentTime: 0,
    duration: 0,
    isStudyMode: false
  });

  // Theme Toggler Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handlePlay = (item: MediaItem) => {
    setPlayerState({
      ...playerState,
      item,
      isPlaying: true,
      isExpanded: true,
      isStudyMode: false // Reset study mode on new track
    });
  };
  
  // Handler for playing an episode from a course
  const handlePlayEpisode = (episode: Episode, course: Course) => {
      // Map Episode + Course to MediaItem structure for the player
      const mediaItem: MediaItem = {
          id: episode.id,
          title: episode.title,
          author: course.instructor,
          coverUrl: course.coverUrl,
          type: 'podcast',
          duration: episode.duration,
          courseTitle: course.title,
          audioUrl: episode.audioUrl
      };
      handlePlay(mediaItem);
  };

  const togglePlay = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const toggleExpand = (expanded: boolean) => {
    setPlayerState(prev => ({ ...prev, isExpanded: expanded }));
  };
  
  const toggleStudyMode = () => {
      setPlayerState(prev => ({ ...prev, isStudyMode: !prev.isStudyMode }));
  }

  // Onboarding modal handlers
  const handleCareerSelect = async (career: string) => {
    if (currentUserId) {
      try {
        await authService.updateSpecialty(currentUserId, career);
        setUser(prev => ({ ...prev, specialty: career }));
        setShowCareerModal(false);
        // Show PWA modal after career selection
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (!isStandalone) {
          setShowPWAModal(true);
        }
      } catch (err) {
        console.error('Error saving specialty:', err);
        setShowCareerModal(false);
      }
    }
  };

  const handleCareerSkip = () => {
    setShowCareerModal(false);
    // Show PWA modal even if career was skipped
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) {
      setShowPWAModal(true);
    }
  };

  const handlePWAClose = () => {
    setShowPWAModal(false);
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'podcasts', icon: Headphones, label: 'Cursos' },
    { id: 'audiobooks', icon: BookOpen, label: 'Libros' },
    { id: 'resources', icon: FolderOpen, label: 'Recursos' },
    { id: 'library', icon: Library, label: 'Mi Biblio' },
  ];

  // ADMIN ROUTE: Completely separate flow
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return <AdminLoginScreen onLoginSuccess={() => setIsAdminAuthenticated(true)} />;
    }
    return <AdminAppWrapper />;
  }

  // USER ROUTE: Show loading spinner while checking auth session
  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-[#050505]">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
      return (
          <>
            {/* Dark mode button for login screen too */}
             <div className="fixed top-6 right-6 z-50">
                 <button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors backdrop-blur-md"
                >
                   {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
             </div>
             <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
          </>
      );
  }

  return (
    <div className="relative h-dvh w-full bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden flex flex-col selection:bg-brand-500/30 transition-colors duration-500 animate-fade-in">

      {/* Onboarding Modals */}
      {showCareerModal && (
        <CareerSelectionModal
          onSelect={handleCareerSelect}
          onSkip={handleCareerSkip}
        />
      )}
      {showPWAModal && (
        <PWAInstallModal
          onClose={handlePWAClose}
          deferredPrompt={deferredPrompt}
        />
      )}

      {/* Dynamic Background Blob - Fixed position - Adapted for Theme */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-200/50 dark:bg-brand-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-200/50 dark:bg-violet-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      {/* Main Scrollable Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative z-10 w-full pb-safe-nav">
        
        {/* Top Header - In scroll flow but at top */}
        <div className="px-4 pt-safe">
            <header className="flex justify-between items-center mb-6 py-4">
            <div className="flex items-center gap-2">
                {/* Logo horizontal de Intelia */}
                <img
                  src="/logo-horizontal.png"
                  alt="Intelia"
                  className="h-20 w-auto"
                />
            </div>
            <div className="flex gap-3 items-center">
                <button 
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                   {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button 
                onClick={() => setView('profile')}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-300 ${view === 'profile' || view === 'edit-profile' ? 'border-brand-500 scale-110 shadow-lg' : 'border-slate-200 dark:border-white/20 hover:border-brand-300 dark:hover:border-white/50'}`}
                >
                <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=6366f1&color=fff&size=64`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
                </button>
            </div>
            </header>

            {/* Views */}
            <div className="min-h-[50vh]">
            {/* Loading and Error States for Content Views */}
            {['home', 'podcasts', 'audiobooks', 'resources'].includes(view) && contentLoading && (
              <div className="flex flex-col items-center justify-center py-16 animate-pulse">
                <div className="w-12 h-12 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 dark:text-white/50 text-sm">Cargando contenido...</p>
              </div>
            )}
            {['home', 'podcasts', 'audiobooks', 'resources'].includes(view) && contentError && !contentLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="text-red-500 dark:text-red-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-white/70 mb-2">Error al cargar</h3>
                <p className="text-sm text-slate-500 dark:text-white/50 mb-4">{contentError}</p>
                <button
                  onClick={loadUserContent}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}
            {!contentLoading && !contentError && view === 'home' && <HomeView onPlay={handlePlay} courses={userCourses} />}
            {!contentLoading && !contentError && view === 'podcasts' && <EngineeringCoursesView onPlayEpisode={handlePlayEpisode} courses={userCourses} />}
            {!contentLoading && !contentError && view === 'audiobooks' && <AudiobooksView items={userAudiobooks} onPlay={handlePlay} />}
            {!contentLoading && !contentError && view === 'resources' && <ResourcesView onPlay={handlePlay} resources={userResources} />}
            {view === 'library' && <LibraryView />}
            {view === 'profile' && <ProfileView user={user} onEditProfile={() => setView('edit-profile')} onLogout={() => setIsAuthenticated(false)} isAdmin={isAdmin} onAdminPanel={() => setView('admin')} />}
            {view === 'edit-profile' && <EditProfileView user={user} onSave={(newData) => { setUser(newData); setView('profile'); }} onCancel={() => setView('profile')} />}

            {/* Admin Views - Protected */}
            {view === 'admin' && isAdmin && <AdminDashboard stats={stats} onNavigate={setView} />}
            {view === 'admin-courses' && isAdmin && (
              <AdminCoursesView
                courses={courses}
                onBack={() => setView('admin')}
                onCreateCourse={createCourse}
                onUpdateCourse={updateCourse}
                onDeleteCourse={deleteCourse}
                onCreateEpisode={createEpisode}
                onUpdateEpisode={updateEpisode}
                onDeleteEpisode={deleteEpisode}
                uploadAudio={uploadAudio}
                uploadCover={uploadCover}
              />
            )}
            {view === 'admin-audiobooks' && isAdmin && (
              <AdminAudiobooksView
                audiobooks={audiobooks}
                onBack={() => setView('admin')}
                onCreateAudiobook={createAudiobook}
                onUpdateAudiobook={updateAudiobook}
                onDeleteAudiobook={deleteAudiobook}
                onCreateChapter={createChapter}
                onUpdateChapter={updateChapter}
                onDeleteChapter={deleteChapter}
                uploadAudio={uploadAudio}
                uploadCover={uploadCover}
              />
            )}
            {view === 'admin-resources' && isAdmin && (
              <AdminResourcesView
                resources={resources}
                onBack={() => setView('admin')}
                onCreateResource={createResource}
                onUpdateResource={updateResource}
                onDeleteResource={deleteResource}
                uploadVideo={uploadVideo}
                uploadPDF={uploadPDF}
                uploadCover={uploadCover}
              />
            )}
            </div>
        </div>

      </main>

      {/* Player Overlay/Mini - Fixed */}
      <Player 
        state={playerState} 
        onClose={() => setPlayerState(prev => ({ ...prev, item: null }))}
        onTogglePlay={togglePlay}
        onExpand={toggleExpand}
        onToggleStudyMode={toggleStudyMode}
      />

      {/* Bottom Navigation - Fixed with safe area for all mobile devices */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#050505]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 z-30 transition-colors duration-500 nav-bottom-safe">
        <div className="flex justify-around items-center h-[80px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 ${
                  isActive ? 'text-brand-600 dark:text-white' : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70'
                }`}
              >
                <div className={`relative p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-50 dark:bg-brand-500/20 translate-y-[-4px]' : ''}`}>
                    <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full" />}
                </div>
                <span className={`text-[10px] font-medium transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}