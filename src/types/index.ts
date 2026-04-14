// ============================================================
// Tipos TypeScript — RemunaIA (sincronizado com schema Supabase)
// ============================================================

export type TipoMovimento = 'promocao' | 'aumento' | 'contratacao' | 'ajuste_faixa'
export type Regime = 'clt' | 'pj'
export type Plano = 'trial' | 'starter' | 'professional' | 'enterprise' | 'cancelado'
export type NivelRisco = 'baixo' | 'medio' | 'alto'
export type StatusSimulacao = 'pendente' | 'processando' | 'concluido' | 'erro'
export type NivelSenioridade = 'junior' | 'pleno' | 'senior' | 'especialista' | 'lideranca'

// ---- Profile (tabela: public.profiles) ----
export interface Profile {
  id: string
  nome: string
  empresa: string
  setor_empresa?: string
  plano: Plano
  simulacoes_usadas_mes: number
  mes_contagem_simulacoes?: string
  trial_expira_em?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  criado_em: string
  atualizado_em: string
}

// ---- Formulário — espelha colunas da tabela simulacoes + benefícios para IA ----
export interface FormularioSimulacao {
  tipo: TipoMovimento
  cargo_atual: string
  cargo_proposto?: string
  salario_atual: number
  salario_proposto: number
  regime: Regime
  setor: string
  estado: string
  contexto_adicional?: string
  budget_informado: boolean
  budget_valor?: number
  pares_existem: boolean
  salario_medio_pares?: number
  historico_avaliacao?: string
  politica_salarial?: string
  nivel_senioridade?: NivelSenioridade
  tempo_cargo?: string
  // Benefícios (usados pela IA para calcular Total Rewards)
  vr_mensal?: number
  vt_mensal?: number
  plano_saude_mensal?: number
  plr_percentual?: number
  bonus_target_percentual?: number
}

// ---- Resultado JSON (campo resultado JSONB) ----
export interface TabelaFinanceiraItem {
  componente: string
  valor_atual: number
  valor_proposto: number
  variacao_percentual: number
  custo_total_empresa: number
}

export interface BenchmarkMercado {
  p25: number
  p50: number
  p75: number
  fonte: string
}

export interface EquidadeInterna {
  status: 'adequado' | 'atencao' | 'critico'
  posicao_relativa: string
  minimo_grupo: number
  mediana_grupo: number
  maximo_grupo: number
  observacao?: string
}

export interface Risco {
  nivel: NivelRisco
  descricao: string
  mitigacao?: string
}

export interface Recomendacao {
  decisao: 'aprovado' | 'aprovado_com_ressalvas' | 'reprovado' | 'aguardar'
  justificativa: string
  salario_sugerido?: number
  percentual_sugerido?: number
  proximos_passos?: string[]
}

// Total Rewards — pacote completo de remuneração
export interface TotalRewards {
  // Valores mensais (proposto)
  salario_base: number
  vr_mensal: number
  vt_mensal: number
  plano_saude_mensal: number
  // Valores anuais
  plr_anual: number
  bonus_anual: number
  total_anual: number
  // Métricas de mercado
  compa_ratio: number          // salário / P50 × 100 (ex: 95 = 5% abaixo da mediana)
  posicao_faixa: 'abaixo' | 'dentro' | 'acima'
}

export interface ResultadoSimulacao {
  tabela_financeira: TabelaFinanceiraItem[]
  benchmark_mercado: BenchmarkMercado
  equidade_interna: EquidadeInterna
  riscos: Risco[]
  recomendacao: Recomendacao
  conclusao: string
  total_rewards?: TotalRewards
}

// ---- Simulação (tabela: public.simulacoes) ----
export interface Simulacao {
  id: string
  user_id: string
  tipo: TipoMovimento
  cargo_atual: string
  cargo_proposto?: string
  salario_atual: number
  salario_proposto: number
  regime: Regime
  setor: string
  estado: string
  contexto_adicional?: string
  budget_informado: boolean
  budget_valor?: number
  pares_existem: boolean
  salario_medio_pares?: number
  nivel_senioridade?: NivelSenioridade
  resultado?: ResultadoSimulacao
  status: StatusSimulacao
  erro_mensagem?: string
  prompt_version: string
  criado_em: string
  concluido_em?: string
}

// ---- Controle de limites ----
export interface LimiteSimulacao {
  pode_simular: boolean
  motivo?: 'trial_expirado' | 'limite_mensal_atingido' | 'plano_cancelado'
  simulacoes_usadas: number
  limite_mensal: number
}
