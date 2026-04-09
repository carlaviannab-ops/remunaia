import { formatarMoeda, labelTipo, labelRegime } from '../../lib/utils'
import type { Simulacao } from '../../types'

interface Props {
  simulacao: Simulacao
}

export default function ResumoScenario({ simulacao }: Props) {
  const f = simulacao.formulario

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Cenário Simulado</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Tipo</p>
          <p className="font-medium text-gray-900">{labelTipo[simulacao.tipo]}</p>
        </div>
        {f.colaborador && (
          <div>
            <p className="text-gray-400">Colaborador</p>
            <p className="font-medium text-gray-900">{f.colaborador}</p>
          </div>
        )}
        <div>
          <p className="text-gray-400">Cargo</p>
          <p className="font-medium text-gray-900">{f.cargo}</p>
        </div>
        <div>
          <p className="text-gray-400">Nível</p>
          <p className="font-medium text-gray-900">{f.nivel}</p>
        </div>
        {f.regime && (
          <div>
            <p className="text-gray-400">Regime</p>
            <p className="font-medium text-gray-900">{labelRegime[f.regime]}</p>
          </div>
        )}
        {f.salario_atual != null && (
          <div>
            <p className="text-gray-400">Salário atual</p>
            <p className="font-medium text-gray-900">{formatarMoeda(f.salario_atual)}</p>
          </div>
        )}
        {f.area && (
          <div>
            <p className="text-gray-400">Área</p>
            <p className="font-medium text-gray-900">{f.area}</p>
          </div>
        )}
        {f.localizacao && (
          <div>
            <p className="text-gray-400">Localização</p>
            <p className="font-medium text-gray-900">{f.localizacao}</p>
          </div>
        )}
      </div>
    </div>
  )
}
