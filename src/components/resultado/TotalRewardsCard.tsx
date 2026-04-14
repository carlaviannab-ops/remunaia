import { formatarMoeda } from '../../lib/utils'
import type { TotalRewards } from '../../types'

interface Props {
  totalRewards: TotalRewards
}

function CompaRatioBadge({ ratio }: { ratio: number }) {
  const cor = ratio < 90
    ? 'bg-red-100 text-red-700'
    : ratio > 110
    ? 'bg-blue-100 text-blue-700'
    : 'bg-green-100 text-green-700'
  const label = ratio < 90 ? 'Abaixo do mercado' : ratio > 110 ? 'Acima do mercado' : 'Na faixa de mercado'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cor}`}>
      {ratio.toFixed(1)}% — {label}
    </span>
  )
}

export default function TotalRewardsCard({ totalRewards: tr }: Props) {
  const linhas = [
    { label: 'Salário base (mensal)', valor: tr.salario_base, destaque: false },
    { label: 'Vale-refeição/alimentação', valor: tr.vr_mensal, destaque: false },
    { label: 'Vale-transporte', valor: tr.vt_mensal, destaque: false },
    { label: 'Plano de saúde (empresa)', valor: tr.plano_saude_mensal, destaque: false },
  ].filter(l => l.valor > 0)

  const linhasAnuais = [
    { label: 'PLR (anual)', valor: tr.plr_anual },
    { label: 'Bônus target (anual)', valor: tr.bonus_anual },
  ].filter(l => l.valor > 0)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Total Rewards — Pacote Completo</h3>
        <CompaRatioBadge ratio={tr.compa_ratio} />
      </div>

      {/* Componentes mensais */}
      <div className="space-y-2 mb-3">
        {linhas.map(l => (
          <div key={l.label} className="flex justify-between text-sm">
            <span className="text-gray-600">{l.label}</span>
            <span className="font-medium text-gray-900">{formatarMoeda(l.valor)}/mês</span>
          </div>
        ))}
      </div>

      {/* Componentes anuais variáveis */}
      {linhasAnuais.length > 0 && (
        <>
          <div className="border-t border-dashed border-gray-200 my-3" />
          <div className="space-y-2 mb-3">
            {linhasAnuais.map(l => (
              <div key={l.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{l.label}</span>
                <span className="font-medium text-gray-900">{formatarMoeda(l.valor)}/ano</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Total anual */}
      <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
        <span className="font-semibold text-gray-800">Total anual estimado</span>
        <span className="text-lg font-bold text-primary-600">{formatarMoeda(tr.total_anual)}</span>
      </div>

      {/* Compa-ratio explicado */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
        <span className="font-medium text-gray-700">Compa-ratio: </span>
        Salário proposto ÷ mediana de mercado (P50) × 100. Indica se a remuneração está abaixo (&lt;90%), na faixa (90–110%) ou acima (&gt;110%) do mercado.
      </div>
    </div>
  )
}
