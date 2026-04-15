import { formatarMoeda } from '../../lib/utils'
import type { RoadmapSalarial } from '../../types'

interface Props {
  roadmap: RoadmapSalarial
}

const ETAPA_COR = [
  { circulo: 'bg-blue-500 text-white',  linha: 'bg-blue-200',   tag: 'bg-blue-50 text-blue-700 border-blue-200' },
  { circulo: 'bg-indigo-500 text-white', linha: 'bg-indigo-200', tag: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { circulo: 'bg-primary-600 text-white',linha: '',              tag: 'bg-primary-50 text-primary-700 border-primary-200' },
]

export default function RoadmapSalarialCard({ roadmap: rm }: Props) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="font-semibold text-gray-900">Plano de Nivelamento Salarial</h3>
        <p className="text-xs text-gray-400 mt-0.5">{rm.objetivo}</p>
      </div>

      <div className="relative">
        {rm.etapas.map((etapa, i) => {
          const cor = ETAPA_COR[i] ?? ETAPA_COR[2]
          const isLast = i === rm.etapas.length - 1
          return (
            <div key={etapa.numero} className="flex gap-4 mb-0">
              {/* Linha do tempo */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${cor.circulo}`}>
                  {etapa.numero}
                </div>
                {!isLast && <div className={`w-0.5 flex-1 my-1 min-h-[40px] ${cor.linha}`} />}
              </div>

              {/* Conteúdo */}
              <div className={`flex-1 ${!isLast ? 'pb-6' : 'pb-0'}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{etapa.data_alvo}</span>
                    <span className="text-xs text-gray-400 ml-2">({etapa.prazo})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cor.tag}`}>
                      +{etapa.percentual_aumento}%
                    </span>
                    <span className="text-sm font-bold text-gray-900">{formatarMoeda(etapa.salario_alvo)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-1">{etapa.descricao}</p>
                <div className="flex items-start gap-1">
                  <svg className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-400 italic">{etapa.condicao}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Meta final */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Salário alvo ao final do plano</p>
          <p className="text-lg font-bold text-primary-600">{formatarMoeda(rm.salario_final)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Prazo total</p>
          <p className="text-sm font-semibold text-gray-700">{rm.etapas[rm.etapas.length - 1]?.prazo ?? '12–18 meses'}</p>
        </div>
      </div>

      {rm.observacao && (
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-dashed border-gray-100">
          {rm.observacao}
        </p>
      )}
    </div>
  )
}
