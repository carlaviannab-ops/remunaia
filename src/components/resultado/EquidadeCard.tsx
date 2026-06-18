import type { EquidadeInterna } from '../../types'

interface Props {
  equidade: EquidadeInterna
}

const corRisco: Record<string, string> = {
  baixo: 'text-green-700 bg-green-50',
  medio: 'text-yellow-700 bg-yellow-50',
  alto: 'text-red-700 bg-red-50',
}

const labelRisco: Record<string, string> = {
  baixo: 'Risco Baixo',
  medio: 'Risco Médio',
  alto: 'Risco Alto',
}

export default function EquidadeCard({ equidade }: Props) {
  const nivelCor = corRisco[equidade.risco_distorcao] ?? 'text-gray-700 bg-gray-100'
  const nivelLabel = labelRisco[equidade.risco_distorcao] ?? equidade.risco_distorcao

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Equidade Interna</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${nivelCor}`}>
          {nivelLabel}
        </span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3">{equidade.analise}</p>

      {equidade.recomendacao_equidade && (
        <p className="text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-3">
          💡 {equidade.recomendacao_equidade}
        </p>
      )}
    </div>
  )
}
