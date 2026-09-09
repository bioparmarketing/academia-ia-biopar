-- ============================================================
-- 002_rls.sql — Row Level Security
-- Academia de IA BioPar
-- ============================================================

-- ============================================================
-- Habilitar RLS em todas as tabelas
-- ============================================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNÇÃO AUXILIAR: obter role do usuário autenticado
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- POLICIES: profiles
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;

-- Cada usuário lê seu próprio perfil
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin lê todos os perfis
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Usuário atualiza seu próprio perfil (não pode alterar role)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- POLICIES: courses
-- ============================================================
DROP POLICY IF EXISTS "courses_select_authenticated" ON public.courses;

-- Qualquer usuário autenticado lê cursos ativos
CREATE POLICY "courses_select_authenticated"
  ON public.courses FOR SELECT
  USING (auth.uid() IS NOT NULL AND active = TRUE);

-- ============================================================
-- POLICIES: modules
-- ============================================================
DROP POLICY IF EXISTS "modules_select_authenticated" ON public.modules;

-- Qualquer usuário autenticado lê módulos ativos
CREATE POLICY "modules_select_authenticated"
  ON public.modules FOR SELECT
  USING (auth.uid() IS NOT NULL AND active = TRUE);

-- ============================================================
-- POLICIES: activities
-- ============================================================
DROP POLICY IF EXISTS "activities_select_authenticated" ON public.activities;

-- Qualquer usuário autenticado lê atividades
CREATE POLICY "activities_select_authenticated"
  ON public.activities FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- POLICIES: user_progress
-- ============================================================
DROP POLICY IF EXISTS "progress_select_own"    ON public.user_progress;
DROP POLICY IF EXISTS "progress_select_admin"  ON public.user_progress;
DROP POLICY IF EXISTS "progress_insert_own"    ON public.user_progress;
DROP POLICY IF EXISTS "progress_update_own"    ON public.user_progress;

-- Student lê apenas seu próprio progresso
CREATE POLICY "progress_select_own"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Admin lê progresso de todos
CREATE POLICY "progress_select_admin"
  ON public.user_progress FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Student insere seu próprio progresso
CREATE POLICY "progress_insert_own"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Student atualiza seu próprio progresso
CREATE POLICY "progress_update_own"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- POLICIES: activity_attempts
-- ============================================================
DROP POLICY IF EXISTS "attempts_select_own"   ON public.activity_attempts;
DROP POLICY IF EXISTS "attempts_select_admin" ON public.activity_attempts;
DROP POLICY IF EXISTS "attempts_insert_own"   ON public.activity_attempts;

-- Student lê apenas suas próprias tentativas
CREATE POLICY "attempts_select_own"
  ON public.activity_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Admin lê tentativas de todos
CREATE POLICY "attempts_select_admin"
  ON public.activity_attempts FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Student insere suas próprias tentativas
CREATE POLICY "attempts_insert_own"
  ON public.activity_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
