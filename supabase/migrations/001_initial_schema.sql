-- ============================================================
-- RemunaIA — Schema inicial
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT,
  empresa       TEXT,
  plano         TEXT NOT NULL DEFAULT 'starter' CHECK (plano IN ('starter', 'professional', 'enterprise')),
  simulacoes_mes INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_plano ON public.profiles(plano);
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- ============================================================
-- TABELA: simulacoes
-- ============================================================
CREATE TABLE public.simulacoes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL CHECK (tipo IN ('promocao', 'aumento_salarial', 'nova_contratacao', 'ajuste_faixa')),
  formulario JSONB NOT NULL,
  resultado  JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_simulacoes_user_id ON public.simulacoes(user_id);
CREATE INDEX idx_simulacoes_tipo ON public.simulacoes(tipo);
CREATE INDEX idx_simulacoes_created_at ON public.simulacoes(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "profiles: leitura própria"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: atualização própria"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies: simulacoes
CREATE POLICY "simulacoes: leitura própria"
  ON public.simulacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "simulacoes: inserção própria"
  ON public.simulacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "simulacoes: exclusão própria"
  ON public.simulacoes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: criar profile ao registrar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at automático em profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TRIGGER: reset mensal de simulacoes_mes
-- ============================================================
CREATE OR REPLACE FUNCTION public.reset_simulacoes_mes()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profiles SET simulacoes_mes = 0;
END;
$$;
-- (chamar via pg_cron no Supabase Dashboard: '0 0 1 * *')

-- ============================================================
-- LGPD: política de retenção (comentário documentado)
-- ============================================================
-- Dados de simulações são retidos por 24 meses após última atividade.
-- Profiles de usuários cancelados são anonimizados após 90 dias.
-- Ver: documentacao/legal/02_politica_privacidade_lgpd.md
