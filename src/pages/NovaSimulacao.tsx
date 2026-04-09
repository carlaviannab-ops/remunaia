import { useState } from 'react'
import WizardProgress from '../components/simulacao/WizardProgress'
import Passo1Tipo from '../components/simulacao/Passo1Tipo'
import Passo2Dados from '../components/simulacao/Passo2Dados'
import Passo3Contexto from '../components/simulacao/Passo3Contexto'
import { useSimulacao } from '../hooks/useSimulacao'
import type { FormularioSimulacao, TipoMovimento } from '../types'

const PASSOS = ['Tipo', 'Dados', 'Contexto']

export default function NovaSimulacao() {
  const [passo, setPasso] = useState(1)
  const [tipo, setTipo] = useState<TipoMovimento | ''>('')
  const [dados, setDados] = useState<Partial<FormularioSimulacao>>({})
  const { simular, loading, erro } = useSimulacao()

  function atualizarCampo(campo: keyof FormularioSimulacao, valor: string | number) {
    setDados(prev => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit() {
    if (!tipo) return
    await simular(tipo, { ...dados, tipo } as FormularioSimulacao)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nova Simulação</h1>

      <div className="card p-6">
        <WizardProgress passoAtual={passo} totalPassos={3} labels={PASSOS} />

        {passo === 1 && (
          <Passo1Tipo
            valor={tipo}
            onChange={setTipo}
            onProximo={() => setPasso(2)}
          />
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
