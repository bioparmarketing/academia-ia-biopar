-- ============================================================
-- 001_schema.sql — Estrutura principal do banco
-- Academia de IA BioPar
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- Perfis dos usuários (1:1 com auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  department  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: courses
-- Cursos disponíveis na plataforma
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: modules
-- Módulos de cada curso
-- ============================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id          UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  number             INTEGER NOT NULL,
  title              TEXT NOT NULL,
  description        TEXT,
  estimated_minutes  INTEGER NOT NULL DEFAULT 20,
  content            JSONB,
  active             BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (course_id, number)
);

-- ============================================================
-- TABELA: activities
-- Atividades dentro de cada módulo
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id     UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('content', 'ai_practice', 'quiz')),
  title         TEXT NOT NULL,
  instructions  TEXT,
  content       JSONB,
  sequence      INTEGER NOT NULL DEFAULT 1,
  UNIQUE (module_id, sequence)
);

-- ============================================================
-- TABELA: user_progress
-- Progresso do aluno por módulo
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id    UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score        INTEGER,
  UNIQUE (user_id, module_id)
);

-- ============================================================
-- TABELA: activity_attempts
-- Tentativas de atividade do aluno
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_attempts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id    UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  answer         TEXT,
  score          INTEGER,
  feedback       TEXT,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: criar profile automaticamente ao criar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
