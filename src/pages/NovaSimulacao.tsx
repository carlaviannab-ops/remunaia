import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WizardProgress from '../components/simulacao/WizardProgress'
import Passo1Tipo from '../components/simulacao/Passo1Tipo'
import Passo2Dados from '../components/simulacao/Passo2Dados'
import Passo3Contexto from '../components/simulacao/Passo3Contexto'
import { useSimulacao } from '../hooks/useSimulacao'
import { useAuth } from '../hooks/useAuth'
import type { FormularioSimulacao, TipoMovimento } from '../types'

const LIMITES_PLANO: Record<string, number> = {
  trial: 3, starter: 20, professional: 999999, enterprise: 999999, cancelado: 0,
}

function UpgradeWall({ plano }: { plano: string }) {
  const navigate = useNavigate()
  const isTrial = plano === 'trial'
  return (
    <div className="max-w-md mx-auto text-center py-10 px-4">
      <div className="text-5xl mb-4">{isTrial ? '🚀' : '📊'}</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {isTrial ? 'Suas simulações gratuitas acabaram' : 'Limite mensal atingido'}
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        {isTrial
          ? 'Você usou as 3 simulações do trial. Assine o Professional para ter acesso ilimitado com ROI de Retenção, Flight Risk Score, Script de Comunicação e muito mais.'
          : 'Você atingiu o limite de simulações deste mês. Faça upgrade para o Professional e tenha acesso ilimitado.'}
      </p>
      <div className="space-y-3">
        <button onClick={() => navigate('/planos')} className="btn-primary w-full">
          Ver planos — a partir de R$ 197/mês
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full text-sm">
          Voltar ao dashboard
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-4">PIX · Ativação em 1 hora útil · Cancele quando quiser</p>
    </div>
  )
}

const PASSOS = ['Tipo', 'Dados', 'Contexto']

export default function NovaSimulacao() {
  const { profile } = useAuth()
  const [passo, setPasso] = useState(1)

  // Verificar limite antes de mostrar o formulário
  const plano = profile?.plano ?? 'trial'
  const usadas = profile?.simulacoes_usadas_mes ?? 0
  const limite = LIMITES_PLANO[plano] ?? 0
  if (profile && usadas >= limite) {
    return <UpgradeWall plano={plano} />
  }
  const [tipo, setTipo] = useState<TipoMovimento | ''>('')
  const [dados, setDados] = useState<Partial<FormularioSimulacao>>({
    budget_informado: false,
    pares_existem: false,
  })

  function handleTipoChange(novoTipo: TipoMovimento) {
    setTipo(novoTipo)
    // Limpa campos irrelevantes ao mudar o tipo
    setDados({
      budget_informado: false,
      pares_existem: false,
      regime: dados.regime,
      setor: dados.setor,
      estado: dados.estado,
    })
  }
  const { simular, loading, erro } = useSimulacao()

  function atualizarCampo(campo: keyof FormularioSimulacao, valor: string | number | boolean) {
    setDados(prev => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit() {
    if (!tipo) return
    await simular({ ...dados, tipo } as FormularioSimulacao)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nova Simulação</h1>

      <div className="card p-6">
        <WizardProgress passoAtual={passo} totalPassos={3} labels={PASSOS} />

        {passo === 1 && (
          <Passo1Tipo valor={tipo} onChange={handleTipoChange} onProximo={() => setPasso(2)} />
        )}
        {passo === 2 && (
          <Passo2Dados
            tipo={tipo as TipoMovimento}
            dados={dados}
            onChange={atualizarCampo}
            onProximo={() => setPasso(3)}
            onVoltar={() => setPasso(1)}
          />
        )}
        {passo === 3 && (
          <Passo3Contexto
            tipo={tipo as TipoMovimento}
            dados={dados}
            onChange={atualizarCampo}
            onSubmit={handleSubmit}
            onVoltar={() => setPasso(2)}
            loading={loading}
          />
        )}

        {erro && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{erro}</p>
        )}
      </div>
    </div>
  )
}
