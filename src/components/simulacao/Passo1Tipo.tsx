import type { TipoMovimento } from '../../types'

interface Props {
  valor: TipoMovimento | ''
  onChange: (v: TipoMovimento) => void
  onProximo: () => void
}

const opcoes: { tipo: TipoMovimento; titulo: string; descricao: string; icone: string }[] = [
  {
    tipo: 'promocao',
    titulo: 'Promoção',
    descricao: 'Avalie o impacto financeiro e de equidade de uma promoção de cargo.',
    icone: '🚀',
  },
  {
    tipo: 'aumento',
    titulo: 'Aumento Salarial',
    descricao: 'Simule um aumento de mérito ou reajuste e compare com o mercado.',
    icone: '📈',
  },
  {
    tipo: 'contratacao',
    titulo: 'Nova Contratação',
    descricao: 'Defina a proposta salarial ideal para atrair o melhor candidato.',
    icone: '🤝',
  },
  {
    tipo: 'ajuste_faixa',
    titulo: 'Ajuste de Faixa',
    descricao: 'Redefina a faixa salarial de um cargo com base no mercado.',
    icone: '⚖️',
  },
]

export default function Passo1Tipo({ valor, onChange, onProximo }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Tipo de movimento</h2>
      <p className="text-sm text-gray-500 mb-6">Selecione o que deseja simular</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {opcoes.map(op => (
          <button
            key={op.tipo}
            onClick={() => onChange(op.tipo)}
            className={`text-left p-5 rounded-xl border-2 transition-all ${
              valor === op.tipo
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="text-2xl mb-2">{op.icone}</div>
            <div className="font-semibold text-gray-900">{op.titulo}</div>
            <div className="text-sm text-gray-500 mt-1">{op.descricao}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={onProximo} disabled={!valor} className="btn-primary disabled:opacity-40">
          Próximo →
        </button>
      </div>
    </div>
  )
}
