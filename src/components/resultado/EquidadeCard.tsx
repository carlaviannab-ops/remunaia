import { formatarMoeda } from '../../lib/utils'
import type { EquidadeInterna } from '../../types'

interface Props {
  equidade: EquidadeInterna
}

const corStatus: Record<string, string> = {
  adequado: 'text-green-700 bg-green-50',
  atencao: 'text-yellow-700 bg-yellow-50',
  critico: 'text-red-700 bg-red-50',
}

export default function EquidadeCard({ equidade }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Equidade Interna</h3>

      <div className="flex items-center gap-3 mb-4">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            corStatus[equidade.status] ?? 'text-gray-700 bg-gray-100'
          }`}
        >
          {equidade.status.charAt(0).toUpperCase() + equidade.status.slice(1)}
        </span>
        <span className="text-sm text-gray-500">
          Posição relativa no grupo: <strong>{equidade.posicao_relativa}</strong>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Mínimo do grupo</p>
          <p className="font-semibold text-gray-900 mt-0.5">{formatarMoeda(equidade.minimo_grupo)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Mediana do grupo</p>
          <p className="font-semibold text-gray-900 mt-0.5">{formatarMoeda(equidade.mediana_grupo)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Máximo do grupo</p>
          <p className="font-semibold text-gray-900 mt-0.5">{formatarMoeda(equidade.maximo_grupo)}</p>
        </div>
      </div>

      {equidade.observacao && (
        <p className="text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-3">
          💡 {equidade.observacao}
        </p>
      )}
    </div>
  )
}
