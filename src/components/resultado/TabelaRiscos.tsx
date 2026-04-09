import Badge from '../ui/Badge'
import type { Risco } from '../../types'

interface Props {
  riscos: Risco[]
}

export default function TabelaRiscos({ riscos }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Análise de Riscos</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {riscos.map((risco, i) => (
          <div key={i} className="px-5 py-4 flex items-start gap-4">
            <div className="pt-0.5">
              <Badge nivel={risco.nivel} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{risco.descricao}</p>
              {risco.mitigacao && (
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">Mitigação:</span> {risco.mitigacao}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
