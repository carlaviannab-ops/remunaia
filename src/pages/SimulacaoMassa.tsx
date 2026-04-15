import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatarMoeda } from '../lib/utils'
import Spinner from '../components/ui/Spinner'
import type { NivelSenioridade, Regime } from '../types'

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

interface LinhaFormulario {
  id: string
  cargo_atual: string
  nivel_senioridade: NivelSenioridade | ''
  regime: Regime | ''
  setor: string
  estado: string
  salario_atual: string
  salario_proposto: string
}

interface ResultadoLinha {
  id: string
  cargo_atual: string
  salario_atual: number
  salario_proposto: number
  status: 'aguardando' | 'processando' | 'concluido' | 'erro'
  p50?: number
  compa_ratio?: number
  posicao_faixa?: string
  flight_risk_score?: number
  flight_risk_nivel?: string
  decisao?: string
  erro?: string
  sim_id?: string
}

function novaLinha(): LinhaFormulario {
  return {
    id: crypto.randomUUID(),
    cargo_atual: '',
    nivel_senioridade: '',
    regime: 'clt',
    setor: '',
    estado: 'SP',
    salario_atual: '',
    salario_proposto: '',
  }
}

export default function SimulacaoMassa() {
  const navigate = useNavigate()
  const [linhas, setLinhas] = useState<LinhaFormulario[]>([novaLinha(), novaLinha()])
  const [processando, setProcessando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [resultados, setResultados] = useState<ResultadoLinha[]>([])
  const [erro, setErro] = useState('')

  function atualizarLinha(id: string, campo: keyof LinhaFormulario, valor: string) {
    setLinhas(prev => prev.map(l => l.id === id ? { ...l, [campo]: valor } : l))
  }

  function adicionarLinha() {
    setLinhas(prev => [...prev, novaLinha()])
  }

  function removerLinha(id: string) {
    if (linhas.length <= 2) return
    setLinhas(prev => prev.filter(l => l.id !== id))
  }

  function linhasValidas() {
    return linhas.filter(l =>
      l.cargo_atual.trim() &&
      l.regime &&
      l.setor.trim() &&
      l.estado &&
      Number(l.salario_atual) > 0 &&
      Number(l.salario_proposto) > 0
    )
  }

  async function processar() {
    const validas = linhasValidas()
    if (validas.length === 0) { setErro('Preencha ao menos uma linha completa.'); return }

    setErro('')
    setProcessando(true)
    setProgresso(0)

    const resultadosIniciais: ResultadoLinha[] = validas.map(l => ({
      id: l.id,
      cargo_atual: l.cargo_atual,
      salario_atual: Number(l.salario_atual),
      salario_proposto: Number(l.salario_proposto),
      status: 'aguardando',
    }))
    setResultados(resultadosIniciais)

    const novosResultados = [...resultadosIniciais]

    for (let i = 0; i < validas.length; i++) {
      const linha = validas[i]
      novosResultados[i] = { ...novosResultados[i], status: 'processando' }
      setResultados([...novosResultados])

      try {
        const { data, error } = await supabase.functions.invoke('simulate', {
          body: {
            tipo: 'aumento',
            cargo_atual: linha.cargo_atual,
            salario_atual: Number(linha.salario_atual),
            salario_proposto: Number(linha.salario_proposto),
            regime: linha.regime || 'clt',
            setor: linha.setor,
            estado: linha.estado,
            nivel_senioridade: linha.nivel_senioridade || null,
            budget_informado: false,
            pares_existem: false,
          },
        })

        if (error || !data?.resultado) throw new Error(error?.message ?? 'Erro na simulação')

        const r = data.resultado
        novosResultados[i] = {
          ...novosResultados[i],
          status: 'concluido',
          p50: r.benchmark_mercado?.p50,
          compa_ratio: r.total_rewards?.compa_ratio,
          posicao_faixa: r.total_rewards?.posicao_faixa,
          flight_risk_score: r.flight_risk?.score,
          flight_risk_nivel: r.flight_risk?.nivel,
          decisao: r.recomendacao?.decisao,
          sim_id: data.id,
        }
      } catch (e: any) {
        novosResultados[i] = { ...novosResultados[i], status: 'erro', erro: e.message }
      }

      setResultados([...novosResultados])
      setProgresso(Math.round(((i + 1) / validas.length) * 100))
    }

    setProcessando(false)
  }

  const concluidos = resultados.filter(r => r.status === 'concluido')
  const impactoTotal = concluidos.reduce((acc, r) => acc + (r.salario_proposto - r.salario_atual) * 12, 0)
  const mediaCompaRatio = concluidos.length > 0
    ? concluidos.reduce((acc, r) => acc + (r.compa_ratio ?? 0), 0) / concluidos.length
    : 0
  const emRisco = concluidos.filter(r => r.flight_risk_nivel === 'alto' || r.flight_risk_nivel === 'critico').length

  const niveis: NivelSenioridade[] = ['junior', 'pleno', 'senior', 'especialista', 'lideranca']
  const niveisLabel: Record<NivelSenioridade, string> = {
    junior: 'Júnior', pleno: 'Pleno', senior: 'Sênior', especialista: 'Especialista', lideranca: 'Liderança',
  }
  const decisaoLabel: Record<string, string> = {
    aprovado: 'Aprovado', aprovado_com_ressalvas: 'Aprovado c/ ressalvas',
    reprovado: 'Reprovado', aguardar: 'Aguardar',
  }
  const decisaoCor: Record<string, string> = {
    aprovado: 'text-green-700 bg-green-50',
    aprovado_com_ressalvas: 'text-yellow-700 bg-yellow-50',
    reprovado: 'text-red-700 bg-red-50',
    aguardar: 'text-gray-600 bg-gray-100',
  }
  const riscoCor: Record<string, string> = {
    baixo: 'text-green-700', moderado: 'text-yellow-600',
    alto: 'text-orange-600', critico: 'text-red-700',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/historico')} className="text-sm text-gray-500 hover:text-gray-900">
            ← Histórico
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Simulação em Massa</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analise o impacto financeiro de múltiplos movimentos salariais de uma vez</p>
        </div>
      </div>

      {/* Aviso de créditos */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
        Cada linha consome 1 simulação do seu plano. {linhasValidas().length} linha{linhasValidas().length !== 1 ? 's' : ''} preenchida{linhasValidas().length !== 1 ? 's' : ''} = {linhasValidas().length} simulação{linhasValidas().length !== 1 ? 'ões' : ''}.
      </div>

      {/* Tabela de entrada */}
      {!processando && resultados.length === 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium w-48">Cargo *</th>
                <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Nível</th>
                <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Regime *</th>
                <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium w-32">Setor *</th>
                <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">UF *</th>
                <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Sal. Atual (R$) *</th>
                <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Sal. Proposto (R$) *</th>
                <th className="px-3 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {linhas.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      className="input text-xs py-1.5"
                      placeholder={`Ex: Analista de RH`}
                      value={l.cargo_atual}
                      onChange={e => atualizarLinha(l.id, 'cargo_atual', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select className="input text-xs py-1.5" value={l.nivel_senioridade} onChange={e => atualizarLinha(l.id, 'nivel_senioridade', e.target.value)}>
                      <option value="">—</option>
                      {niveis.map(n => <option key={n} value={n}>{niveisLabel[n]}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select className="input text-xs py-1.5" value={l.regime} onChange={e => atualizarLinha(l.id, 'regime', e.target.value)}>
                      <option value="clt">CLT</option>
                      <option value="pj">PJ</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input className="input text-xs py-1.5" placeholder="Ex: TI" value={l.setor} onChange={e => atualizarLinha(l.id, 'setor', e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <select className="input text-xs py-1.5" value={l.estado} onChange={e => atualizarLinha(l.id, 'estado', e.target.value)}>
                      {UFS.map(uf => <option key={uf}>{uf}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input className="input text-xs py-1.5" type="number" min={0} placeholder="5000" value={l.salario_atual} onChange={e => atualizarLinha(l.id, 'salario_atual', e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <input className="input text-xs py-1.5" type="number" min={0} placeholder="5500" value={l.salario_proposto} onChange={e => atualizarLinha(l.id, 'salario_proposto', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => removerLinha(l.id)} disabled={linhas.length <= 2} className="text-gray-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button onClick={adicionarLinha} className="text-sm text-primary-600 hover:underline">
              + Adicionar linha
            </button>
            <p className="text-xs text-gray-400">{linhas.length} linha{linhas.length !== 1 ? 's' : ''} · {linhasValidas().length} válida{linhasValidas().length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{erro}</p>}

      {/* Botão processar */}
      {resultados.length === 0 && (
        <div className="flex justify-end">
          <button
            onClick={processar}
            disabled={processando || linhasValidas().length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            {processando && <Spinner tamanho="sm" />}
            Analisar {linhasValidas().length} colaborador{linhasValidas().length !== 1 ? 'es' : ''}
          </button>
        </div>
      )}

      {/* Progresso */}
      {processando && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Processando simulações...</span>
            <span className="font-medium text-primary-700">{progresso}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="space-y-4">

          {/* Cards de resumo */}
          {concluidos.length > 0 && !processando && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500">Colaboradores analisados</p>
                <p className="text-2xl font-bold text-primary-700 mt-1">{concluidos.length}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500">Impacto anual total</p>
                <p className="text-2xl font-bold text-primary-700 mt-1">{formatarMoeda(impactoTotal)}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500">Compa-ratio médio</p>
                <p className={`text-2xl font-bold mt-1 ${mediaCompaRatio < 90 ? 'text-red-600' : mediaCompaRatio > 110 ? 'text-blue-600' : 'text-green-600'}`}>
                  {mediaCompaRatio.toFixed(1)}%
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500">Em risco de saída</p>
                <p className={`text-2xl font-bold mt-1 ${emRisco > 0 ? 'text-red-600' : 'text-green-600'}`}>{emRisco}</p>
              </div>
            </div>
          )}

          {/* Tabela de resultados */}
          <div className="card overflow-x-auto">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Resultados por colaborador</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Cargo</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Sal. Atual</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Sal. Proposto</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">P50 Mercado</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Compa-ratio</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Flight Risk</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Decisão IA</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {resultados.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.cargo_atual}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatarMoeda(r.salario_atual)}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">{formatarMoeda(r.salario_proposto)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {r.status === 'processando' ? <Spinner tamanho="sm" /> : r.p50 ? formatarMoeda(r.p50) : r.status === 'erro' ? <span className="text-red-500 text-xs">{r.erro?.slice(0, 30)}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.compa_ratio != null ? (
                        <span className={`font-medium ${r.compa_ratio < 90 ? 'text-red-600' : r.compa_ratio > 110 ? 'text-blue-600' : 'text-green-600'}`}>
                          {r.compa_ratio.toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.flight_risk_score != null && r.flight_risk_nivel ? (
                        <span className={`font-medium ${riscoCor[r.flight_risk_nivel] ?? 'text-gray-600'}`}>
                          {r.flight_risk_score} <span className="text-xs capitalize">({r.flight_risk_nivel})</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.decisao ? (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${decisaoCor[r.decisao] ?? 'text-gray-600 bg-gray-100'}`}>
                          {decisaoLabel[r.decisao] ?? r.decisao}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.sim_id && (
                        <button onClick={() => window.open(`/simulacao/${r.sim_id}/resultado`, '_blank')} className="text-xs text-primary-600 hover:underline">
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!processando && (
            <div className="flex justify-between">
              <button onClick={() => { setResultados([]); setProgresso(0) }} className="btn-secondary text-sm">
                Nova análise
              </button>
              <button onClick={() => navigate('/historico')} className="btn-primary text-sm">
                Ver histórico
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
