import { useState } from 'react'
import type { ScriptComunicacao, Recomendacao } from '../../types'

interface Props {
  script: ScriptComunicacao
  decisao: Recomendacao['decisao']
}

type Aba = 'aprovacao' | 'aprovacao_parcial' | 'negativa'

const ABAS: { key: Aba; label: string; cor: string }[] = [
  { key: 'aprovacao', label: 'Aprovado', cor: 'text-green-700 border-green-500 bg-green-50' },
  { key: 'aprovacao_parcial', label: 'Com ressalvas', cor: 'text-yellow-700 border-yellow-500 bg-yellow-50' },
  { key: 'negativa', label: 'Não aprovado', cor: 'text-red-700 border-red-400 bg-red-50' },
]

function abaParaDecisao(decisao: Recomendacao['decisao']): Aba {
  if (decisao === 'aprovado') return 'aprovacao'
  if (decisao === 'aprovado_com_ressalvas' || decisao === 'aguardar') return 'aprovacao_parcial'
  return 'negativa'
}

export default function ScriptComunicacaoCard({ script, decisao }: Props) {
  const [aba, setAba] = useState<Aba>(abaParaDecisao(decisao))
  const [copiado, setCopiado] = useState(false)

  const texto = script[aba]

  function copiar() {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Script de Comunicação</h3>
          <p className="text-xs text-gray-400 mt-0.5">Roteiro pronto para a conversa com o colaborador</p>
        </div>
        <button
          onClick={copiar}
          className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          {copiado ? '✓ Copiado!' : 'Copiar texto'}
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-4">
        {ABAS.map(a => (
          <button
            key={a.key}
            onClick={() => setAba(a.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              aba === a.key
                ? a.cor
                : 'text-gray-400 border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {texto}
      </div>

      <p className="text-xs text-gray-300 mt-3">
        Personalize antes de usar. A aba destacada corresponde à decisão da IA para esta simulação.
      </p>
    </div>
  )
}
