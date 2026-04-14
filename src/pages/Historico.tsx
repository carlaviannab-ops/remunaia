import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatarData, labelTipo, formatarMoeda } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import type { Simulacao } from '../types'

function ComparacaoModal({ a, b, onFechar }: { a: Simulacao; b: Simulacao; onFechar: () => void }) {
  const ra = a.resultado
  const rb = b.resultado

  const linhas = [
    { label: 'Cargo', va: a.cargo_atual + (a.cargo_proposto ? ` → ${a.cargo_proposto}` : ''), vb: b.cargo_atual + (b.cargo_proposto ? ` → ${b.cargo_proposto}` : '') },
    { label: 'Tipo', va: labelTipo[a.tipo], vb: labelTipo[b.tipo] },
    { label: 'Salário proposto', va: formatarMoeda(a.salario_proposto), vb: formatarMoeda(b.salario_proposto) },
    { label: 'Benchmark P50', va: ra?.benchmark_mercado ? formatarMoeda(ra.benchmark_mercado.p50) : '—', vb: rb?.benchmark_mercado ? formatarMoeda(rb.benchmark_mercado.p50) : '—' },
    { label: 'Compa-ratio', va: ra?.total_rewards?.compa_ratio != null ? `${ra.total_rewards.compa_ratio.toFixed(1)}%` : '—', vb: rb?.total_rewards?.compa_ratio != null ? `${rb.total_rewards.compa_ratio.toFixed(1)}%` : '—' },
    { label: 'Total Rewards anual', va: ra?.total_rewards?.total_anual ? formatarMoeda(ra.total_rewards.total_anual) : '—', vb: rb?.total_rewards?.total_anual ? formatarMoeda(rb.total_rewards.total_anual) : '—' },
    { label: 'Equidade interna', va: ra?.equidade_interna?.status ?? '—', vb: rb?.equidade_interna?.status ?? '—' },
    { label: 'Decisão IA', va: ra?.recomendacao?.decisao?.replace(/_/g, ' ') ?? '—', vb: rb?.recomendacao?.decisao?.replace(/_/g, ' ') ?? '—' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Comparar Simulações</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase">
                <th className="text-left pb-3 w-1/3"></th>
                <th className="text-center pb-3 w-1/3 text-primary-600">Simulação A</th>
                <th className="text-center pb-3 w-1/3 text-gray-600">Simulação B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {linhas.map(l => (
                <tr key={l.label}>
                  <td className="py-2.5 text-gray-500 font-medium">{l.label}</td>
                  <td className="py-2.5 text-center text-gray-900">{l.va}</td>
                  <td className="py-2.5 text-center text-gray-900">{l.vb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={() => window.open(`/simulacao/${a.id}/resultado`, '_blank')} className="btn-secondary flex-1 text-xs">
            Ver resultado A
          </button>
          <button onClick={() => window.open(`/simulacao/${b.id}/resultado`, '_blank')} className="btn-secondary flex-1 text-xs">
            Ver resultado B
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Historico() {
  const navigate = useNavigate()
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [comparando, setComparando] = useState(false)

  useEffect(() => {
    supabase
      .from('simulacoes')
      .select('*')
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        setSimulacoes(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtradas = simulacoes.filter(s => {
    const termo = busca.toLowerCase()
    return (
      s.cargo_atual?.toLowerCase().includes(termo) ||
      s.cargo_proposto?.toLowerCase().includes(termo) ||
      labelTipo[s.tipo]?.toLowerCase().includes(termo)
    )
  })

  function toggleSelecionada(id: string) {
    setSelecionadas(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const simA = simulacoes.find(s => s.id === selecionadas[0])
  const simB = simulacoes.find(s => s.id === selecionadas[1])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Simulações</h1>
        <button onClick={() => navigate('/simulacao/nova')} className="btn-primary">
          ➕ Nova Simulação
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-sm"
          placeholder="Buscar por cargo ou tipo..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        {selecionadas.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">{selecionadas.length} selecionada{selecionadas.length > 1 ? 's' : ''}</span>
            {selecionadas.length === 2 && (
              <button onClick={() => setComparando(true)} className="btn-primary py-1 px-3 text-xs">
                Comparar
              </button>
            )}
            <button onClick={() => setSelecionadas([])} className="text-gray-400 hover:text-gray-700 text-xs">
              Limpar
            </button>
          </div>
        )}
        {selecionadas.length === 0 && simulacoes.length >= 2 && (
          <span className="text-xs text-gray-400">Selecione 2 simulações para comparar</span>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center p-10"><Spinner tamanho="md" /></div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              {busca ? 'Nenhuma simulação encontrada.' : 'Nenhuma simulação realizada ainda.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtradas.map(sim => {
              const risco = sim.resultado?.riscos?.[0]?.nivel ?? 'baixo'
              const isSelected = selecionadas.includes(sim.id)
              return (
                <div
                  key={sim.id}
                  className={`px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 border-l-2 border-primary-500' : ''}`}
                >
                  <div
                    className="flex items-center gap-3 flex-1"
                    onClick={() => navigate(`/simulacao/${sim.id}/resultado`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {sim.cargo_atual}
                        {sim.cargo_proposto ? ` → ${sim.cargo_proposto}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {labelTipo[sim.tipo]} · {formatarData(sim.criado_em)}
                        {sim.resultado?.total_rewards?.compa_ratio != null && (
                          <span className="ml-2 font-medium text-gray-600">
                            CR: {sim.resultado.total_rewards.compa_ratio.toFixed(1)}%
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge nivel={risco as any} />
                    <button
                      onClick={e => { e.stopPropagation(); toggleSelecionada(sim.id) }}
                      className={`w-5 h-5 rounded border flex items-center justify-center text-xs transition-colors ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 hover:border-primary-400'}`}
                    >
                      {isSelected ? '✓' : ''}
                    </button>
                    <span className="text-gray-300">›</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {comparando && simA && simB && (
        <ComparacaoModal a={simA} b={simB} onFechar={() => setComparando(false)} />
      )}
    </div>
  )
}
