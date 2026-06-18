/**
 * ADAPTADOR DE SCHEMA — fonte única de verdade para o frontend.
 *
 * Por que isso existe:
 *   O campo `resultado` no banco é JSONB livre — pode ter sido salvo por qualquer
 *   versão do Edge Function (v1 a v60+). Quando o schema muda, simulações antigas
 *   continuam com os campos antigos. Sem adaptação, os componentes quebram.
 *
 * Regra de ouro:
 *   Nunca acesse `simulacao.resultado` diretamente nos componentes.
 *   Sempre passe por `normalizarResultado()` primeiro.
 *
 * Como atualizar quando o schema mudar:
 *   1. Atualize o Edge Function (normalizarEValidar) para produzir o novo formato.
 *   2. Atualize os types em src/types/index.ts.
 *   3. Adicione um bloco de compatibilidade AQUI para o campo antigo.
 *   4. Os componentes não precisam mudar.
 */

import type { ResultadoSimulacao, TabelaFinanceiraItem, EquidadeInterna } from '../types'

type RawResult = Record<string, unknown>

function toNum(v: unknown): number {
  if (typeof v === 'number') return isNaN(v) ? 0 : v
  if (typeof v === 'string') return parseFloat(v.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
  return 0
}

function normalizarNivel(s: string): 'baixo' | 'medio' | 'alto' {
  const n = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (n === 'baixo' || n === 'low') return 'baixo'
  if (n === 'alto' || n === 'high' || n === 'critico' || n === 'critical') return 'alto'
  return 'medio'
}

/**
 * Converte qualquer versão do resultado salvo em banco para o schema canônico v60.
 * Chamar UMA vez no início de cada página que renderiza resultados.
 */
export function normalizarResultado(raw: RawResult): ResultadoSimulacao {
  // shallow copy — não muta o objeto original
  const r = { ...raw } as RawResult

  // ── tabela_financeira (schema antigo, array flat) → simulacao_financeira.tabela ──
  if (!r.simulacao_financeira && Array.isArray(r.tabela_financeira)) {
    const antiga = r.tabela_financeira as RawResult[]
    r.simulacao_financeira = {
      tabela: antiga.map<TabelaFinanceiraItem>((item) => ({
        cenario: (item.componente as string) || 'Cenário',
        salario_mensal: toNum(item.valor_proposto),
        variacao_percentual: toNum(item.variacao_percentual),
        custo_anual_incremental: 0,
        custo_total_empregador_anual: toNum(item.custo_total_empresa),
      })),
    }
    delete r.tabela_financeira
  }

  // ── conclusao → conclusao_estrategica ───────────────────────────────────────
  if (!r.conclusao_estrategica && r.conclusao) {
    r.conclusao_estrategica = r.conclusao
    delete r.conclusao
  }

  // ── script_comunicacao (schema antigo) → comunicacao_colaborador ────────────
  if (!r.comunicacao_colaborador && r.script_comunicacao) {
    const sc = r.script_comunicacao as RawResult
    r.comunicacao_colaborador = {
      tom: 'profissional',
      texto: (sc.aprovacao || sc.aprovacao_parcial || sc.negativa || '') as string,
      pontos_chave: [],
    }
    delete r.script_comunicacao
  }

  // ── recomendacao: salario_sugerido → salario_recomendado ────────────────────
  if (r.recomendacao) {
    const rec = { ...(r.recomendacao as RawResult) }
    if (rec.salario_sugerido !== undefined && rec.salario_recomendado === undefined) {
      rec.salario_recomendado = toNum(rec.salario_sugerido)
    }
    if (typeof rec.salario_recomendado !== 'number') {
      rec.salario_recomendado = toNum(rec.salario_recomendado)
    }
    // proximos_passos[] → condicoes string
    if (!rec.condicoes && Array.isArray(rec.proximos_passos)) {
      rec.condicoes = (rec.proximos_passos as string[]).join(' | ')
    }
    r.recomendacao = rec
  }

  // ── equidade_interna: schema antigo (status/posicao_relativa) → v60 ─────────
  if (r.equidade_interna) {
    const eq = r.equidade_interna as RawResult
    if (!eq.risco_distorcao && eq.status) {
      const status = eq.status as string
      const risco = status === 'critico' ? 'alto' : status === 'atencao' ? 'medio' : 'baixo'
      r.equidade_interna = {
        analise: (eq.posicao_relativa || eq.observacao || '') as string,
        risco_distorcao: risco,
        recomendacao_equidade: (eq.observacao || '') as string,
      } as EquidadeInterna
    } else if (eq.risco_distorcao && typeof eq.risco_distorcao === 'string') {
      r.equidade_interna = {
        ...eq,
        risco_distorcao: normalizarNivel(eq.risco_distorcao as string),
      } as EquidadeInterna
    }
  }

  // ── riscos: garantir campo 'risco' como título ───────────────────────────────
  if (Array.isArray(r.riscos)) {
    r.riscos = (r.riscos as RawResult[]).map((item) => {
      if (!item.risco && item.descricao) {
        return { ...item, risco: item.descricao, descricao: '' }
      }
      return item
    })
  }

  // ── garantir comunicacao_colaborador.pontos_chave como array ─────────────────
  if (r.comunicacao_colaborador) {
    const com = r.comunicacao_colaborador as RawResult
    if (!Array.isArray(com.pontos_chave)) com.pontos_chave = []
  }

  return r as unknown as ResultadoSimulacao
}
