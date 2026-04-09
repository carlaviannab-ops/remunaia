import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { gerarPDF } from '../lib/pdf'
import { track, eventos } from '../lib/analytics'
import ResumoScenario from '../components/resultado/ResumoScenario'
import TabelaFinanceira from '../components/resultado/TabelaFinanceira'
import BenchmarkBar from '../components/resultado/BenchmarkBar'
import EquidadeCard from '../components/resultado/EquidadeCard'
import TabelaRiscos from '../components/resultado/TabelaRiscos'
import RecomendacaoCard from '../components/resultado/RecomendacaoCard'
import ConclusaoCard from '../components/resultado/ConclusaoCard'
import Spinner from '../components/ui/Spinner'
import type { Simulacao } from '../types'

export default function Resultado() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [simulacao, setSimulacao] = useState<Simulacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('simulacoes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setSimulacao(data)
        setLoading(false)
        if (data) track(eventos.resultadoVisualizado, { tipo: data.tipo })
      })
  }, [id])

  async function handleExportarPDF() {
    if (!simulacao) return
    setExportando(true)
    try {
      gerarPDF(simulacao)
      track(eventos.pdfExportado, { tipo: simulacao.tipo })
    } finally {
      setExportando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner tamanho="lg" />
      </div>
    )
  }

  if (!simulacao) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Simulação não encontrada.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
          Voltar ao Dashboard
        </button>
      </div>
    )
  }

  const resultado = simulacao.resultado

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          ← Voltar
        </button>
        <h1 className="text-xl font-bold text-gray-900">Resultado da Simulação</h1>
        <div />
      </div>

      <ResumoScenario simulacao={simulacao} />

      {resultado.tabela_financeira?.length > 0 && (
        <TabelaFinanceira itens={resultado.tabela_financeira} />
      )}

      {resultado.benchmark_mercado && (
        <BenchmarkBar
          benchmark={resultado.benchmark_mercado}
          salarioAtual={simulacao.formulario.salario_atual}
          salarioProposto={resultado.recomendacao?.salario_sugerido}
        />
      )}

      {resultado.equidade_interna && (
        <EquidadeCard equidade={resultado.equidade_interna} />
      )}

      {resultado.riscos?.length > 0 && (
        <TabelaRiscos riscos={resultado.riscos} />
      )}

      {resultado.recomendacao && (
        <RecomendacaoCard recomendacao={resultado.recomendacao} />
      )}

      {resultado.conclusao && (
        <ConclusaoCard
          conclusao={resultado.conclusao}
          onExportarPDF={handleExportarPDF}
          onNovaSimulacao={() => navigate('/simulacao/nova')}
          exportando={exportando}
        />
      )}
    </div>
  )
}
