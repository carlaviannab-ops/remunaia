import { formatarMoeda } from '../../lib/utils'
import type { RoiRetencao } from '../../types'

interface Props {
  roi: RoiRetencao
}

function RoiBadge({ valor }: { valor: number }) {
  const cor = valor >= 5
    ? 'text-green-700 bg-green-50 border-green-200'
    : valor >= 2
    ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    : 'text-gray-600 bg-gray-50 border-gray-200'
  return (
    <div className={`inline-flex items-baseline gap-1 px-3 py-1 rounded-full border font-bold text-2xl ${cor}`}>
      {valor.toFixed(1)}
      <span className="text-sm font-medium">x ROI</span>
    </div>
  )
}

export default function RoiRetencaoCard({ roi }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">ROI de Retenção</h3>
          <p className="text-xs text-gray-400 mt-0.5">Custo do aumento vs. custo de perder o colaborador</p>
        </div>
        <RoiBadge valor={roi.roi_multiplicador} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-red-50 rounded-xl p-3">
          <p className="text-xs text-red-500 font-medium mb-1">Custo de substituir</p>
          <p className="text-lg font-bold text-red-700">{formatarMoeda(roi.custo_turnover_estimado)}</p>
          <p className="text-xs text-red-400 mt-0.5">recrutamento + onboarding + perda produtividade</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-green-600 font-medium mb-1">Custo do aumento</p>
          <p className="text-lg font-bold text-green-700">{formatarMoeda(roi.custo_aumento_anual)}</p>
          <p className="text-xs text-green-500 mt-0.5">incremento anual sobre a folha</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 leading-relaxed">
        {roi.interpretacao}
      </div>

      <p className="text-xs text-gray-300 mt-3">
        Fator de turnover utilizado: {roi.fator_utilizado}x salário anual (referência: benchmarks SHRM/ABRHB)
      </p>
    </div>
  )
}
