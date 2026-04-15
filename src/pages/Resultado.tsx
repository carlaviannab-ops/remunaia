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
import TotalRewardsCard from '../components/resultado/TotalRewardsCard'
import RoiRetencaoCard from '../components/resultado/RoiRetencaoCard'
import ScriptComunicacaoCard from '../components/resultado/ScriptComunicacaoCard'
import FontesPesquisaCard from '../components/resultado/FontesPesquisaCard'
import FlightRiskCard from '../components/resultado/FlightRiskCard'
import RoadmapSalarialCard from '../components/resultado/RoadmapSalarialCard'
import Spinner from '../components/ui/Spinner'
import type { Simulacao } from '../types'

export default function Resultado() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [simulacao, setSimulacao] = useState<Simulacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

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
        if (data) track(eventos.RESULTADO_VISTO, { tipo: data.tipo })
      })
  }, [id])

  async function handleExcluir() {
    if (!simulacao) return
    setExcluindo(true)
    await supabase.from('simulacoes').delete().eq('id', simulacao.id)
    navigate('/historico')
  }

  async function handleExportarPDF() {
    if (!simulacao) return
    setExportando(true)
    try {
      gerarPDF(simulacao)
      track(eventos.PDF_EXPORTADO, { tipo: simulacao.tipo })
    } finally {
      setExportando(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner tamanho="lg" /></div>
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

  const r = simulacao.resultado

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold text-gray-900">Resultado da Simulação</h1>
        {confirmandoExclusao ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Excluir?</span>
            <button onClick={handleExcluir} disabled={excluindo} className="text-red-600 font-medium hover:underline">
              {excluindo ? '...' : 'Sim'}
            </button>
            <button onClick={() => setConfirmandoExclusao(false)} className="text-gray-400 hover:text-gray-700">
              Não
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmandoExclusao(true)} className="text-gray-300 hover:text-red-400 transition-colors text-sm" title="Excluir simulação">
            🗑 Excluir
          </button>
        )}
      </div>

      <ResumoScenario simulacao={simulacao} />

      {r?.tabela_financeira && r.tabela_financeira.length > 0 && (
        <TabelaFinanceira itens={r.tabela_financeira} />
      )}

      {r?.benchmark_mercado && (
        <BenchmarkBar
          benchmark={r.benchmark_mercado}
          salarioAtual={simulacao.salario_atual}
          salarioProposto={simulacao.salario_proposto}
          compaRatio={r.total_rewards?.compa_ratio}
        />
      )}

      {r?.fontes_pesquisa && r.fontes_pesquisa.length > 0 && (
        <FontesPesquisaCard fontes={r.fontes_pesquisa} />
      )}

      {r?.equidade_interna && (
        <EquidadeCard equidade={r.equidade_interna} />
      )}

      {r?.riscos && r.riscos.length > 0 && (
        <TabelaRiscos riscos={r.riscos} />
      )}

      {r?.recomendacao && (
        <RecomendacaoCard recomendacao={r.recomendacao} />
      )}

      {r?.total_rewards && r.total_rewards.salario_base > 0 && (
        <TotalRewardsCard totalRewards={r.total_rewards} />
      )}

      {r?.roi_retencao && (
        <RoiRetencaoCard roi={r.roi_retencao} />
      )}

      {r?.flight_risk && (
        <FlightRiskCard flightRisk={r.flight_risk} />
      )}

      {r?.roadmap_salarial && (
        <RoadmapSalarialCard roadmap={r.roadmap_salarial} />
      )}

      {r?.script_comunicacao && r?.recomendacao && (
        <ScriptComunicacaoCard
          script={r.script_comunicacao}
          decisao={r.recomendacao.decisao}
        />
      )}

      {r?.conclusao && (
        <ConclusaoCard
          conclusao={r.conclusao}
          onExportarPDF={handleExportarPDF}
          onNovaSimulacao={() => navigate('/simulacao/nova')}
          exportando={exportando}
        />
      )}
    </div>
  )
}
