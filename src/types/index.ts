// ============================================================
// Tipos TypeScript — RemunaIA
// ============================================================

export type TipoMovimento = 'promocao' | 'aumento' | 'contratacao' | 'ajuste_faixa'
export type Regime = 'clt' | 'pj'
export type Plano = 'trial' | 'starter' | 'professional' | 'enterprise' | 'cancelado'
export type NivelRisco = 'baixo' | 'medio' | 'alto'
export type Urgencia = 'imediata' | 'pode aguardar' | 'não recomendado agora'
export type StatusSimulacao = 'pendente' | 'processando' | 'concluido' | 'erro'

export interface Profile {
  id: string
  nome: string
  empresa: string
  setor_empresa?: string
  plano: Plano
  simulacoes_usadas_mes: number
  trial_expira_em: string
  stripe_customer_id?: string
  criado_em: string
  atualizado_em: string
}

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
  nivel_senioridade?: string
  tempo_cargo?: string
}

export interface TabelaFinanceiraItem {
  cenario: string
  salario_mensal: number
  variacao_percentual: number
  custo_anual_incremental: number
}

export interface BenchmarkMercado {
  fonte: string
  p25: number
  p50: number
  p75: number
  p90: number
  posicionamento_atual: string
  posicionamento_proposto: string
  ajuste_setor: string
  nota: string
}

export interface EquidadeInterna {
  analise: string
  risco_distorcao: NivelRisco
  recomendacao_equidade: string
}

export interface Risco {
  risco: string
  nivel: NivelRisco
  descricao: string
  mitigacao: string
}

export interface Recomendacao {
  decisao: string
  salario_recomendado: number
  justificativa: string
  condicoes: string
  urgencia: Urgencia
}

export interface ResultadoSimulacao {
  resumo_cenario: string
  simulacao_financeira: {
    tabela: TabelaFinanceiraItem[]
    nota: string
  }
  benchmark_mercado: BenchmarkMercado
  equidade_interna: EquidadeInterna
  riscos: Risco[]
  recomendacao: Recomendacao
  conclusao_estrategica: string
  suposicoes_adotadas: string[]
}

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
  resultado?: ResultadoSimulacao
  status: StatusSimulacao
  erro_mensagem?: string
  prompt_version: string
  criado_em: string
  concluido_em?: string
}

export interface LimiteSimulacao {
  pode_simular: boolean
  motivo?: 'trial_expirado' | 'limite_mensal_atingido' | 'plano_cancelado'
  simulacoes_usadas: number
  limite_mensal: number
}
