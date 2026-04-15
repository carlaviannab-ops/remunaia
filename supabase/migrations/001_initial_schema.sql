-- ============================================================
-- RemunaIA — Schema de Produção
-- Sincronizado com o banco ao vivo em 2026-04-15
-- Projeto Supabase: hyxgcqgnpsfofddmsodi
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- Estende auth.users com dados de plano, empresa e controle de uso
-- ============================================================
CREATE TABLE public.profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome                     TEXT,
  empresa                  TEXT,
  setor_empresa            TEXT,

  -- Plano comercial
  plano                    TEXT NOT NULL DEFAULT 'trial'
                             CHECK (plano IN ('trial', 'starter', 'professional', 'enterprise', 'cancelado'))
                             COMMENT ON COLUMN public.profiles.plano IS 'trial | starter | professional | enterprise | cancelado',

  -- Controle de limite mensal de simulações
  simulacoes_usadas_mes    INTEGER NOT NULL DEFAULT 0
                             COMMENT ON COLUMN public.profiles.simulacoes_usadas_mes IS 'Contador resetado mensalmente — usado para limitar plano Starter (20/mês)',
  mes_contagem_simulacoes  DATE DEFAULT date_trunc('month', NOW())
                             COMMENT ON COLUMN public.profiles.mes_contagem_simulacoes IS 'Mês de referência do contador atual',

  -- Trial
  trial_expira_em          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),

  -- Pagamento (reservado — atualmente não usado, PIX manual)
  stripe_customer_id       TEXT UNIQUE,
  stripe_subscription_id   TEXT UNIQUE,

  criado_em                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do RemunaIA, estendendo auth.users';

-- Índices
CREATE INDEX idx_profiles_plano ON public.profiles(plano);

-- ============================================================
-- TABELA: simulacoes
-- Cada linha = uma simulação de remuneração realizada
-- ============================================================
CREATE TABLE public.simulacoes (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Tipo de movimento (valores aceitos pelo formulário e Edge Function)
  tipo                 TEXT NOT NULL
                         CHECK (tipo IN ('promocao', 'aumento', 'contratacao', 'ajuste_faixa')),

  -- Dados do formulário (preenchidos na inserção)
  cargo_atual          TEXT NOT NULL,
  cargo_proposto       TEXT,
  salario_atual        NUMERIC NOT NULL,
  salario_proposto     NUMERIC NOT NULL,
  regime               TEXT NOT NULL DEFAULT 'clt'
                         CHECK (regime IN ('clt', 'pj')),
  setor                TEXT NOT NULL,
  estado               TEXT NOT NULL,
  contexto_adicional   TEXT,
  budget_informado     BOOLEAN NOT NULL DEFAULT FALSE,
  budget_valor         NUMERIC,
  pares_existem        BOOLEAN NOT NULL DEFAULT FALSE,
  salario_medio_pares  NUMERIC,
  historico_avaliacao  TEXT,
  politica_salarial    TEXT,
  nivel_senioridade    TEXT
                         CHECK (nivel_senioridade IN ('junior', 'pleno', 'senior', 'especialista', 'lideranca') OR nivel_senioridade IS NULL),
  tempo_cargo          TEXT,

  -- Resultado da IA (JSONB completo — ver estrutura abaixo)
  resultado            JSONB,

  -- Metadados de processamento
  prompt_version       TEXT NOT NULL DEFAULT '1.0',
  status               TEXT NOT NULL DEFAULT 'pendente'
                         CHECK (status IN ('pendente', 'processando', 'concluido', 'erro')),
  erro_mensagem        TEXT,

  criado_em            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  concluido_em         TIMESTAMPTZ
);

COMMENT ON TABLE public.simulacoes IS 'Todas as simulações de remuneração realizadas na plataforma';
COMMENT ON COLUMN public.simulacoes.resultado IS 'JSON completo retornado pela IA: tabela_financeira, benchmark_mercado, equidade_interna, riscos, recomendacao, conclusao, total_rewards, roi_retencao, script_comunicacao, fontes_pesquisa, flight_risk, roadmap_salarial';
COMMENT ON COLUMN public.simulacoes.prompt_version IS 'Versão do prompt master usado — permite auditar e reprocessar com versão mais nova';
COMMENT ON COLUMN public.simulacoes.status IS 'pendente | processando | concluido | erro';

-- Índices
CREATE INDEX idx_simulacoes_user_id   ON public.simulacoes(user_id);
CREATE INDEX idx_simulacoes_tipo      ON public.simulacoes(tipo);
CREATE INDEX idx_simulacoes_criado_em ON public.simulacoes(criado_em DESC);
CREATE INDEX idx_simulacoes_status    ON public.simulacoes(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
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
  INSERT INTO public.profiles (id, nome, empresa)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'empresa', '')
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
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_atualizado_em
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- FUNÇÃO: reset mensal de simulacoes_usadas_mes
-- Chamar via pg_cron no Supabase Dashboard: '0 0 1 * *'
-- ============================================================
CREATE OR REPLACE FUNCTION public.reset_simulacoes_mes()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profiles
  SET simulacoes_usadas_mes = 0,
      mes_contagem_simulacoes = date_trunc('month', NOW());
END;
$$;

-- ============================================================
-- ESTRUTURA DO CAMPO resultado (JSONB) — Referência
-- ============================================================
-- {
--   "tabela_financeira": [
--     { "componente": string, "valor_atual": number, "valor_proposto": number,
--       "variacao_percentual": number, "custo_total_empresa": number }
--   ],
--   "benchmark_mercado": { "p25": number, "p50": number, "p75": number, "fonte": string },
--   "equidade_interna": {
--     "status": "adequado"|"atencao"|"critico",
--     "posicao_relativa": string, "minimo_grupo": number,
--     "mediana_grupo": number, "maximo_grupo": number, "observacao": string
--   },
--   "riscos": [{ "nivel": "baixo"|"medio"|"alto", "descricao": string, "mitigacao": string }],
--   "recomendacao": {
--     "decisao": "aprovado"|"aprovado_com_ressalvas"|"reprovado"|"aguardar",
--     "justificativa": string, "salario_sugerido": number,
--     "percentual_sugerido": number, "proximos_passos": [string]
--   },
--   "conclusao": string,
--
--   "total_rewards": {
--     "salario_base": number, "vr_mensal": number, "vt_mensal": number,
--     "plano_saude_mensal": number, "plr_anual": number, "bonus_anual": number,
--     "total_anual": number, "compa_ratio": number,
--     "posicao_faixa": "abaixo"|"dentro"|"acima"
--   },
--
--   "roi_retencao": {                          -- omitido em ajuste_faixa ou sem aumento
--     "custo_turnover_estimado": number,
--     "custo_aumento_anual": number,
--     "roi_multiplicador": number,
--     "fator_utilizado": number,
--     "interpretacao": string
--   },
--
--   "script_comunicacao": {
--     "aprovacao": string,
--     "aprovacao_parcial": string,
--     "negativa": string
--   },
--
--   "fontes_pesquisa": [                       -- sempre presente, 4-5 fontes
--     { "nome": string, "organizacao": string,
--       "tipo": "pesquisa_salarial"|"dados_governamentais"|"portal_empregos"|"consultoria"|"associacao_setorial",
--       "cobertura": string, "ano_referencia": string, "url": string, "relevancia": string }
--   ],
--
--   "flight_risk": {                           -- omitido em ajuste_faixa
--     "score": number,  -- 0-100
--     "nivel": "baixo"|"moderado"|"alto"|"critico",
--     "fatores": { "gap_salarial": string, "tempo_cargo": string,
--                  "senioridade": string, "demanda_mercado": string },
--     "resumo": string
--   },
--
--   "roadmap_salarial": {                      -- omitido se aprovado + compa_ratio >= 90
--     "objetivo": string,
--     "etapas": [
--       { "numero": number, "prazo": string, "data_alvo": string,
--         "salario_alvo": number, "percentual_aumento": number,
--         "condicao": string, "descricao": string }
--     ],
--     "salario_final": number,
--     "observacao": string
--   }
-- }

-- ============================================================
-- LGPD: política de retenção
-- ============================================================
-- Dados de simulações são retidos enquanto a conta estiver ativa.
-- Após cancelamento: dados anonimizados em 90 dias conforme Política de Privacidade.
-- Usuário pode solicitar exclusão: carla.viannab@gmail.com (resp. em até 15 dias úteis).
