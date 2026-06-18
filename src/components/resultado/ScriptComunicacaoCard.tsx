import { useState } from 'react'
import type { ComunicacaoColaborador } from '../../types'

interface Props {
  comunicacao: ComunicacaoColaborador
}

export default function ScriptComunicacaoCard({ comunicacao }: Props) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    if (!comunicacao.texto) return
    navigator.clipboard.writeText(comunicacao.texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Script de Comunicação</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Tom: <span className="font-medium text-gray-600">{comunicacao.tom}</span>
          </p>
        </div>
        <button
          onClick={copiar}
          className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          {copiado ? '✓ Copiado!' : 'Copiar texto'}
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
        {comunicacao.texto}
      </div>

      {comunicacao.pontos_chave && comunicacao.pontos_chave.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Pontos-chave para destacar
          </p>
          <ul className="space-y-1">
            {comunicacao.pontos_chave.map((ponto, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-primary-500 mt-0.5 shrink-0">›</span>
                {ponto}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-300 mt-3">
        Personalize antes de usar.
      </p>
    </div>
  )
}
