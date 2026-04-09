import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatarData, labelTipo } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import type { Simulacao } from '../types'

export default function Historico() {
  const navigate = useNavigate()
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    supabase
      .from('simulacoes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSimulacoes(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtradas = simulacoes.filter(s => {
    const termo = busca.toLowerCase()
    return (
      s.formulario.cargo?.toLowerCase().includes(termo) ||
      s.formulario.colaborador?.toLowerCase().includes(termo) ||
      labelTipo[s.tipo]?.toLowerCase().includes(termo)
    )
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Simulações</h1>
        <button onClick={() => navigate('/simulacao/nova')} className="btn-primary">
          ➕ Nova Simulação
        </button>
      </div>

      <div>
        <input
          className="input max-w-sm"
          placeholder="Buscar por cargo, colaborador ou tipo..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner tamanho="md" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              {busca ? 'Nenhuma simulação encontrada para esta busca.' : 'Nenhuma simulação realizada ainda.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtradas.map(sim => {
              const resultado = sim.resultado as any
              const risco = resultado?.riscos?.[0]?.nivel ?? 'baixo'
              return (
                <div
                  key={sim.id}
                  onClick={() => navigate(`/simulacao/${sim.id}`)}
                  className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {sim.formulario.cargo}
                      {sim.formulario.colaborador ? ` — ${sim.formulario.colaborador}` : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {labelTipo[sim.tipo]} · {formatarData(sim.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge nivel={risco as any} />
                    <span className="text-gray-300">›</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
