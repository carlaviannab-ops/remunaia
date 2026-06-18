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
  plr_multiplo?: number        // número de salários mensais (ex: 1.5 = 1,5 salário)
  bonus_multiplo?: number      // número de salários mensais (ex: 2 = 2 salários)
}

// ---- Resultado JSON (campo resultado JSONB) — schema v60 ----
export interface TabelaFinanceiraItem {
  cenario: string
  salario_mensal: number
  variacao_percentual: number
  custo_anual_incremental: number
  custo_total_empregador_anual: number
}

export interface SimulacaoFinanceira {
  tabela: TabelaFinanceiraItem[]
  nota?: string
}

export interface BenchmarkMercado {
  p25: number
  p50: number
  p75: number
  p90?: number
  fonte: string
  posicionamento_atual?: string
  posicionamento_proposto?: string
  ajuste_setor?: string
  confiabilidade?: 'alta' | 'media' | 'baixa'
  nota?: string
}

export interface EquidadeInterna {
  analise: string
  risco_distorcao: 'baixo' | 'medio' | 'alto'
  recomendacao_equidade: string
}

export interface Risco {
  risco: string
  nivel: NivelRisco
  descricao: string
  mitigacao?: string
}

export interface Recomendacao {
  decisao: string
  salario_recomendado?: number
  justificativa: string
  condicoes?: string
  urgencia?: 'imediata' | 'pode aguardar' | 'nao recomendado agora'
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

export interface FlightRisk {
  score: number                   // 0–100
  nivel: 'baixo' | 'moderado' | 'alto' | 'critico'
  fatores: {
    gap_salarial: string          // ex: "18% abaixo do P50"
    tempo_cargo: string           // ex: "2 anos sem reajuste"
    senioridade: string           // ex: "Perfil sênior com alta demanda"
    demanda_mercado: string       // ex: "Setor de TI aquecido em SP"
  }
  resumo: string                  // frase de 1-2 linhas com o diagnóstico
}

export interface EtapaRoadmap {
  numero: number
  prazo: string                   // "90 dias"
  data_alvo: string               // "Agosto/2025"
  salario_alvo: number
  percentual_aumento: number
  condicao: string                // critério para liberar este passo
  descricao: string               // o que acontece nesta etapa
}

export interface RoadmapSalarial {
  objetivo: string                // "Atingir P50 de mercado em 12 meses"
  etapas: EtapaRoadmap[]
  salario_final: number
  observacao?: string
}

export type TipoFonte =
  | 'pesquisa_salarial'
  | 'dados_governamentais'
  | 'portal_empregos'
  | 'consultoria'
  | 'associacao_setorial'

export interface FontePesquisa {
  nome: string            // Nome completo da fonte
  organizacao: string     // Entidade responsável
  tipo: TipoFonte
  cobertura: string       // O que cobre (setor, cargos, região)
  ano_referencia: string  // Ano dos dados (ex: "2024")
  url: string             // Link oficial
  relevancia: string      // Por que foi selecionada para esta simulação
}

export interface ComunicacaoColaborador {
  tom: string
  texto: string
  pontos_chave: string[]
}

export interface RoiRetencao {
  custo_turnover_estimado: number   // R$ — custo estimado de perder o colaborador
  custo_aumento_anual: number       // R$ — custo incremental anual do aumento
  roi_multiplicador: number         // custo_turnover / custo_aumento_anual
  fator_utilizado: number           // ex: 1.5 = 1,5x salário anual
  interpretacao: string             // frase explicativa em português
}

export interface ResultadoSimulacao {
  resumo_cenario?: string
  simulacao_financeira?: SimulacaoFinanceira
  benchmark_mercado?: BenchmarkMercado
  equidade_interna?: EquidadeInterna
  riscos?: Risco[]
  recomendacao?: Recomendacao
  conclusao_estrategica?: string
  suposicoes_adotadas?: string[]
  comunicacao_colaborador?: ComunicacaoColaborador
  aviso_metodologia?: string
  // campos legados (simulações salvas antes da v60)
  total_rewards?: TotalRewards
  roi_retencao?: RoiRetencao
  fontes_pesquisa?: FontePesquisa[]
  flight_risk?: FlightRisk
  roadmap_salarial?: RoadmapSalarial
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
