import { formatarMoeda, formatarPorcentagem } from '../../lib/utils'
import type { TabelaFinanceiraItem } from '../../types'

interface Props {
  itens: TabelaFinanceiraItem[]
}

export default function TabelaFinanceira({ itens }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Impacto Financeiro</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Cenário</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Salário Mensal</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Variação</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Custo Incr./ano</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Custo Total Empresa/ano</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {itens.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{item.cenario}</td>
                <td className="px-5 py-3 text-right text-gray-900 font-semibold">
                  {formatarMoeda(item.salario_mensal)}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`font-medium ${(item.variacao_percentual ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatarPorcentagem(item.variacao_percentual)}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-gray-600">
                  {item.custo_anual_incremental != null ? formatarMoeda(item.custo_anual_incremental) : '—'}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">
                  {formatarMoeda(item.custo_total_empregador_anual)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
