<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Intelia - Plataforma Educativa para Ingenieros

Plataforma de aprendizaje premium para profesionales de ingeniería con cursos, audiobooks, podcasts y recursos técnicos.

## Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Icons:** Lucide React

## Requisitos Previos

- Node.js 18+
- Cuenta de Supabase (gratuita)

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [Supabase](https://app.supabase.com)

2. Ir a **Settings > API** y copiar:
   - Project URL
   - anon/public key

3. Configurar variables de entorno en `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Crear tablas en Supabase

1. Ir a **SQL Editor** en tu proyecto de Supabase

2. Ejecutar el archivo `supabase/schema.sql`:
   - Crea todas las tablas necesarias
   - Configura Row Level Security (RLS)
   - Crea políticas de acceso

3. Ejecutar `supabase/seed.sql` para datos de ejemplo

### 4. Configurar Authentication (opcional)

En Supabase Dashboard > Authentication > Providers:

- **Email:** Habilitado por defecto
- **Google:** Configurar OAuth credentials
- **GitHub:** Configurar OAuth App

### 5. Ejecutar la aplicación

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
intelia/
├── lib/
│   └── supabase.ts          # Cliente Supabase
├── services/
│   ├── auth.ts              # Servicio de autenticación
│   ├── courses.ts           # Servicio de cursos
│   ├── audiobooks.ts        # Servicio de audiobooks
│   ├── resources.ts         # Servicio de recursos
│   ├── progress.ts          # Servicio de progreso
│   └── favorites.ts         # Servicio de favoritos
├── hooks/
│   ├── useAuth.ts           # Hook de autenticación
│   ├── useCourses.ts        # Hook de cursos
│   ├── useAudiobooks.ts     # Hook de audiobooks
│   ├── useResources.ts      # Hook de recursos
│   ├── useProgress.ts       # Hook de progreso
│   └── useFavorites.ts      # Hook de favoritos
├── types/
│   └── database.ts          # Tipos de Supabase
├── supabase/
│   ├── schema.sql           # Esquema de BD
│   └── seed.sql             # Datos de ejemplo
├── App.tsx                  # Componente principal
├── types.ts                 # Tipos de la app
└── constants.ts             # Datos mock (legacy)
```

## Esquema de Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuario |
| `courses` | Cursos de ingeniería |
| `episodes` | Episodios de cada curso |
| `audiobooks` | Audiobooks disponibles |
| `chapters` | Capítulos de audiobooks |
| `resources` | PDFs y videos |
| `user_progress` | Progreso del usuario |
| `favorites` | Favoritos del usuario |

## Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
```

## Próximos Pasos

1. Integrar hooks en componentes existentes
2. Migrar LoginScreen a usar authService
3. Implementar persistencia de progreso en Player
4. Agregar funcionalidad de favoritos
5. Configurar Storage para archivos de audio

## Licencia

MIT
