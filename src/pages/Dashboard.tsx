import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatarMoeda, formatarData, labelTipo, corRisco } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import type { Simulacao } from '../types'

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSimulacoes() {
      const { data } = await supabase
        .from('simulacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      if (data) setSimulacoes(data)
      setLoading(false)
    }
    fetchSimulacoes()
  }, [])

  const totalSimulacoes = simulacoes.length
  const impactoTotal = simulacoes.reduce((acc, s) => {
    const resultado = s.resultado as any
    return acc + (resultado?.tabela_financeira?.[0]?.custo_total_empresa ?? 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {profile?.nome?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Bem-vindo ao seu painel de simulações de remuneração
          </p>
        </div>
        <button
          onClick={() => navigate('/simulacao/nova')}
          className="btn-primary flex items-center gap-2"
        >
          <span>➕</span> Nova Simulação
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Simulações realizadas</p>
          <p className="text-3xl font-bold text-primary-700 mt-1">{totalSimulacoes}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Impacto total analisado</p>
          <p className="text-3xl font-bold text-primary-700 mt-1">
            {formatarMoeda(impactoTotal)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Plano atual</p>
          <p className="text-3xl font-bold text-primary-700 mt-1 capitalize">
            {profile?.plano ?? 'Starter'}
          </p>
        </div>
      </div>

      {/* Simulações recentes */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Simulações Recentes</h2>
          {simulacoes.length > 0 && (
            <button
              onClick={() => navigate('/historico')}
              className="text-sm text-primary-600 hover:underline"
            >
              Ver todas
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner tamanho="md" />
          </div>
        ) : simulacoes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Nenhuma simulação realizada ainda.</p>
            <button
              onClick={() => navigate('/simulacao/nova')}
              className="btn-primary mt-4"
            >
              Criar primeira simulação
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {simulacoes.map(sim => {
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
                      {sim.formulario.cargo} — {sim.formulario.colaborador ?? 'Novo colaborador'}
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
