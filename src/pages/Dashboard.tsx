import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatarMoeda, formatarData, labelTipo } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import type { Simulacao } from '../types'

const LIMITES_PLANO: Record<string, number> = {
  trial: 3, starter: 20, professional: 999999, enterprise: 999999, cancelado: 0,
}

function TrialBanner({ usadas, limite, onUpgrade }: { usadas: number; limite: number; onUpgrade: () => void }) {
  const restantes = Math.max(0, limite - usadas)
  const pct = Math.min(100, (usadas / limite) * 100)
  const esgotado = restantes === 0
  const urgente = restantes <= 1

  return (
    <div className={`card p-4 border-2 ${esgotado ? 'border-red-300 bg-red-50' : urgente ? 'border-orange-300 bg-orange-50' : 'border-primary-200 bg-primary-50'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className={`text-sm font-semibold ${esgotado ? 'text-red-700' : urgente ? 'text-orange-700' : 'text-primary-700'}`}>
            {esgotado
              ? 'Suas simulações gratuitas acabaram'
              : `${restantes} simulação${restantes !== 1 ? 'ões' : ''} restante${restantes !== 1 ? 's' : ''} no trial`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {esgotado
              ? 'Assine um plano para continuar usando o RemunaIA.'
              : 'Assine o Professional e tenha acesso ilimitado + ROI de Retenção, Flight Risk Score e mais.'}
          </p>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden w-40">
            <div
              className={`h-full rounded-full transition-all ${esgotado ? 'bg-red-500' : urgente ? 'bg-orange-400' : 'bg-primary-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{usadas} de {limite} utilizadas</p>
        </div>
        <button onClick={onUpgrade} className="btn-primary text-xs shrink-0 py-2 px-4">
          {esgotado ? 'Assinar agora' : 'Ver planos'}
        </button>
      </div>
    </div>
  )
}

function StarterBanner({ usadas, limite, onUpgrade }: { usadas: number; limite: number; onUpgrade: () => void }) {
  const restantes = Math.max(0, limite - usadas)
  const pct = Math.min(100, (usadas / limite) * 100)
  if (restantes > 5) return null
  return (
    <div className="card p-4 border border-yellow-200 bg-yellow-50">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-yellow-800">
            {restantes === 0 ? 'Limite mensal atingido' : `${restantes} simulações restantes este mês`}
          </p>
          <div className="mt-1.5 h-1.5 bg-yellow-200 rounded-full overflow-hidden w-32">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button onClick={onUpgrade} className="text-xs text-yellow-700 font-semibold underline">
          Upgrade para ilimitado
        </button>
      </div>
    </div>
  )
}

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
        .order('criado_em', { ascending: false })
        .limit(5)
      if (data) setSimulacoes(data)
      setLoading(false)
    }
    fetchSimulacoes()
  }, [])

  const impactoTotal = simulacoes.reduce((acc, s) => {
    return acc + (s.salario_proposto - s.salario_atual) * 12
  }, 0)

  const plano = profile?.plano ?? 'trial'
  const usadas = profile?.simulacoes_usadas_mes ?? 0
  const limite = LIMITES_PLANO[plano] ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {profile?.nome?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Painel de simulações de remuneração
          </p>
        </div>
        <button onClick={() => navigate('/simulacao/nova')} className="btn-primary flex items-center gap-2">
          <span>➕</span> Nova Simulação
        </button>
      </div>

      {/* Banners de limite */}
      {plano === 'trial' && (
        <TrialBanner usadas={usadas} limite={limite} onUpgrade={() => navigate('/planos')} />
      )}
      {plano === 'starter' && (
        <StarterBanner usadas={usadas} limite={limite} onUpgrade={() => navigate('/planos')} />
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Simulações realizadas</p>
          <p className="text-3xl font-bold text-primary-700 mt-1">{simulacoes.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Impacto salarial anual analisado</p>
          <p className="text-3xl font-bold text-primary-700 mt-1">{formatarMoeda(impactoTotal)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Plano atual</p>
          <p className="text-3xl font-bold text-primary-700 mt-1 capitalize">{plano}</p>
        </div>
      </div>

      {/* Simulações recentes */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Simulações Recentes</h2>
          {simulacoes.length > 0 && (
            <button onClick={() => navigate('/historico')} className="text-sm text-primary-600 hover:underline">
              Ver todas
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><Spinner tamanho="md" /></div>
        ) : simulacoes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Nenhuma simulação realizada ainda.</p>
            <button onClick={() => navigate('/simulacao/nova')} className="btn-primary mt-4">
              Criar primeira simulação
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {simulacoes.map(sim => {
              const risco = sim.resultado?.riscos?.[0]?.nivel ?? 'baixo'
              return (
                <div
                  key={sim.id}
                  onClick={() => navigate(`/simulacao/${sim.id}/resultado`)}
                  className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{sim.cargo_atual}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {labelTipo[sim.tipo]} · {formatarData(sim.criado_em)}
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
