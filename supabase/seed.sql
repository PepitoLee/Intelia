-- =============================================
-- INTELIA SEED DATA
-- =============================================
-- Run this SQL after schema.sql to populate initial data
-- =============================================

-- =============================================
-- COURSES
-- =============================================
INSERT INTO courses (id, title, instructor, cover_url, level, tags, total_duration) VALUES
  (
    'c1000001-0001-0001-0001-000000000001',
    'Auditoría e implementación de sistemas de inocuidad alimentaria',
    'Ing. Sofia Ramirez',
    'https://images.unsplash.com/photo-1606859191214-25806e8e2423?auto=format&fit=crop&q=80&w=400',
    'Avanzado',
    ARRAY['BPM', 'HACCP', 'ISO 22000'],
    '30 min'
  ),
  (
    'c1000001-0001-0001-0001-000000000002',
    'Lean Six Sigma aplicado a la mejora continua (Green Belt)',
    'Six Sigma Institute',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400',
    'Intermedio',
    ARRAY['Calidad', 'Lean', 'Estadística'],
    '25 min'
  ),
  (
    'c1000001-0001-0001-0001-000000000003',
    'Gestión de Proyectos Basado en el PMBOK 7ma edición',
    'PM Latam',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400',
    'Avanzado',
    ARRAY['Proyectos', 'PMBOK', 'Agile'],
    '52 min'
  ),
  (
    'c1000001-0001-0001-0001-000000000004',
    'Supervisor de Seguridad y Salud en el Trabajo',
    'Seguridad Total',
    'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=400',
    'Básico',
    ARRAY['SSOMA', 'Seguridad', 'Normativa'],
    '45 min'
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- EPISODES
-- =============================================
-- Course 1: Inocuidad Alimentaria
INSERT INTO episodes (id, course_id, title, description, duration, order_index) VALUES
  (
    'e1000001-0001-0001-0001-000000000001',
    'c1000001-0001-0001-0001-000000000001',
    'Calidad Total y Seguridad Alimentaria: De la Teoría a la Práctica',
    'Introducción a los conceptos fundamentales de calidad total aplicados a la seguridad alimentaria.',
    '8:52',
    1
  ),
  (
    'e1000001-0001-0001-0001-000000000002',
    'c1000001-0001-0001-0001-000000000001',
    'Maestros de la Inocuidad: BPM, SOPs y SSOPs',
    'Profundización en las Buenas Prácticas de Manufactura y procedimientos operativos.',
    '9:49',
    2
  ),
  (
    'e1000001-0001-0001-0001-000000000003',
    'c1000001-0001-0001-0001-000000000001',
    'BPM y POES - Más Allá de las Normas',
    'Implementación práctica de BPM y POES en la industria alimentaria.',
    '10:43',
    3
  )
ON CONFLICT DO NOTHING;

-- Course 2: Lean Six Sigma
INSERT INTO episodes (id, course_id, title, description, duration, order_index) VALUES
  (
    'e1000001-0001-0001-0002-000000000001',
    'c1000001-0001-0001-0001-000000000002',
    'Lean Six Sigma - De los Villanos (3Ms) a la Ganancia',
    'Identificación y eliminación de Muda, Mura y Muri en los procesos.',
    '12:04',
    1
  ),
  (
    'e1000001-0001-0001-0002-000000000002',
    'c1000001-0001-0001-0001-000000000002',
    'Más Allá de DMAIC: Fase de Control',
    'Técnicas avanzadas para la fase de control en proyectos Six Sigma.',
    '13:32',
    2
  )
ON CONFLICT DO NOTHING;

-- Course 3: PMBOK 7
INSERT INTO episodes (id, course_id, title, description, duration, order_index) VALUES
  (
    'e1000001-0001-0001-0003-000000000001',
    'c1000001-0001-0001-0001-000000000003',
    'PMBOK 7 y la Gestión de Proyectos en Latinoamérica',
    'Adaptación del PMBOK 7 al contexto latinoamericano.',
    '15:45',
    1
  ),
  (
    'e1000001-0001-0001-0003-000000000002',
    'c1000001-0001-0001-0001-000000000003',
    'PMBOK 7 Más Allá del Cronograma',
    'Gestión del tiempo y recursos en proyectos complejos.',
    '17:03',
    2
  ),
  (
    'e1000001-0001-0001-0003-000000000003',
    'c1000001-0001-0001-0001-000000000003',
    'Proyectos Híbridos: PMBOK 7, Agile y VUCA',
    'Integración de metodologías ágiles con el marco PMBOK 7.',
    '19:16',
    3
  )
ON CONFLICT DO NOTHING;

-- Course 4: Seguridad y Salud
INSERT INTO episodes (id, course_id, title, description, duration, order_index) VALUES
  (
    'e1000001-0001-0001-0004-000000000001',
    'c1000001-0001-0001-0001-000000000004',
    'SSOMA en la Práctica: Trabajos de Alto Riesgo',
    'Gestión de seguridad en trabajos de alto riesgo.',
    '14:20',
    1
  ),
  (
    'e1000001-0001-0001-0004-000000000002',
    'c1000001-0001-0001-0001-000000000004',
    'Del Estrés a la Ergonomía: Tu Salud Laboral',
    'Fundamentos de ergonomía y salud ocupacional.',
    '12:15',
    2
  ),
  (
    'e1000001-0001-0001-0004-000000000003',
    'c1000001-0001-0001-0001-000000000004',
    'SOMA Minero Perú: Salud y Ambiente',
    'Normativa y buenas prácticas en el sector minero peruano.',
    '18:10',
    3
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- AUDIOBOOKS
-- =============================================
INSERT INTO audiobooks (id, title, author, cover_url, total_duration) VALUES
  (
    'a1000001-0001-0001-0001-000000000001',
    'Manual del Ingeniero',
    'Editorial Técnica',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    '8h'
  ),
  (
    'a1000001-0001-0001-0001-000000000002',
    'El Ziel (La Meta)',
    'Eliyahu Goldratt',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    '21h'
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- CHAPTERS
-- =============================================
-- Manual del Ingeniero chapters
INSERT INTO chapters (id, audiobook_id, title, duration, order_index) VALUES
  (
    'ca100001-0001-0001-0001-000000000001',
    'a1000001-0001-0001-0001-000000000001',
    'Capítulo 1: Fundamentos de Ingeniería',
    '45:00',
    1
  ),
  (
    'ca100001-0001-0001-0001-000000000002',
    'a1000001-0001-0001-0001-000000000001',
    'Capítulo 2: Matemáticas Aplicadas',
    '52:30',
    2
  ),
  (
    'ca100001-0001-0001-0001-000000000003',
    'a1000001-0001-0001-0001-000000000001',
    'Capítulo 3: Física para Ingenieros',
    '48:15',
    3
  ),
  (
    'ca100001-0001-0001-0001-000000000004',
    'a1000001-0001-0001-0001-000000000001',
    'Capítulo 4: Diseño y Prototipos',
    '55:00',
    4
  )
ON CONFLICT DO NOTHING;

-- El Ziel chapters
INSERT INTO chapters (id, audiobook_id, title, duration, order_index) VALUES
  (
    'ca100001-0001-0001-0002-000000000001',
    'a1000001-0001-0001-0001-000000000002',
    'Parte 1: La Crisis',
    '1:30:00',
    1
  ),
  (
    'ca100001-0001-0001-0002-000000000002',
    'a1000001-0001-0001-0001-000000000002',
    'Parte 2: El Descubrimiento',
    '1:45:00',
    2
  ),
  (
    'ca100001-0001-0001-0002-000000000003',
    'a1000001-0001-0001-0001-000000000002',
    'Parte 3: Teoría de Restricciones',
    '2:00:00',
    3
  ),
  (
    'ca100001-0001-0001-0002-000000000004',
    'a1000001-0001-0001-0001-000000000002',
    'Parte 4: La Transformación',
    '1:50:00',
    4
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- RESOURCES
-- =============================================
INSERT INTO resources (id, title, author, type, cover_url, pages, duration) VALUES
  (
    'f1000001-0001-0001-0001-000000000001',
    'Norma ISO 9001:2015',
    'ISO / PDF Oficial',
    'pdf',
    'https://images.unsplash.com/photo-1569091791842-7cf9646552dd?auto=format&fit=crop&q=80&w=400',
    45,
    NULL
  ),
  (
    'f1000001-0001-0001-0001-000000000002',
    'Matriz IPERC Modelo',
    'Excel Template',
    'pdf',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
    12,
    NULL
  ),
  (
    'f1000001-0001-0001-0001-000000000003',
    '5S Implementación',
    'Video Guía',
    'video',
    'https://images.unsplash.com/photo-1581094794320-c9146a07e3cd?auto=format&fit=crop&q=80&w=400',
    NULL,
    '08:45'
  ),
  (
    'f1000001-0001-0001-0001-000000000004',
    'Guía de Auditoría Interna ISO 19011',
    'Consultoría Calidad',
    'pdf',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400',
    28,
    NULL
  ),
  (
    'f1000001-0001-0001-0001-000000000005',
    'Introducción a Lean Manufacturing',
    'Academy Pro',
    'video',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
    NULL,
    '15:30'
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Seed data inserted successfully!' AS status;
SELECT
  (SELECT COUNT(*) FROM courses) AS courses_count,
  (SELECT COUNT(*) FROM episodes) AS episodes_count,
  (SELECT COUNT(*) FROM audiobooks) AS audiobooks_count,
  (SELECT COUNT(*) FROM chapters) AS chapters_count,
  (SELECT COUNT(*) FROM resources) AS resources_count;
