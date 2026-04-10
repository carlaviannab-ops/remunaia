import { formatarMoeda } from '../../lib/utils'
import type { Simulacao } from '../../types'

interface Props {
  simulacao: Simulacao
}

const labelTipo: Record<string, string> = {
  promocao:     'Promoção',
  aumento:      'Aumento Salarial',
  contratacao:  'Nova Contratação',
  ajuste_faixa: 'Ajuste de Faixa',
}

const labelRegime: Record<string, string> = { clt: 'CLT', pj: 'PJ' }

export default function ResumoScenario({ simulacao: s }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Cenário Simulado</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Tipo</p>
          <p className="font-medium text-gray-900">{labelTipo[s.tipo]}</p>
        </div>
        <div>
          <p className="text-gray-400">Cargo atual</p>
          <p className="font-medium text-gray-900">{s.cargo_atual}</p>
        </div>
        {s.cargo_proposto && (
          <div>
            <p className="text-gray-400">Cargo proposto</p>
            <p className="font-medium text-gray-900">{s.cargo_proposto}</p>
          </div>
        )}
        <div>
          <p className="text-gray-400">Salário atual</p>
          <p className="font-medium text-gray-900">{formatarMoeda(s.salario_atual)}</p>
        </div>
        <div>
          <p className="text-gray-400">Salário proposto</p>
          <p className="font-medium text-gray-900">{formatarMoeda(s.salario_proposto)}</p>
        </div>
        <div>
          <p className="text-gray-400">Regime</p>
          <p className="font-medium text-gray-900">{labelRegime[s.regime]}</p>
        </div>
        {s.setor && (
          <div>
            <p className="text-gray-400">Setor</p>
            <p className="font-medium text-gray-900">{s.setor}</p>
          </div>
        )}
        {s.estado && (
          <div>
            <p className="text-gray-400">Estado</p>
            <p className="font-medium text-gray-900">{s.estado}</p>
          </div>
        )}
        {s.nivel_senioridade && (
          <div>
            <p className="text-gray-400">Senioridade</p>
            <p className="font-medium text-gray-900 capitalize">{s.nivel_senioridade}</p>
          </div>
        )}
      </div>
    </div>
  )
}
