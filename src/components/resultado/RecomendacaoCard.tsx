import { formatarMoeda, formatarPorcentagem } from '../../lib/utils'
import type { Recomendacao } from '../../types'

interface Props {
  recomendacao: Recomendacao
}

const corDecisao: Record<string, string> = {
  aprovado: 'border-green-400 bg-green-50',
  aprovado_com_ressalvas: 'border-yellow-400 bg-yellow-50',
  reprovado: 'border-red-400 bg-red-50',
  aguardar: 'border-blue-400 bg-blue-50',
}

const iconDecisao: Record<string, string> = {
  aprovado: '✅',
  aprovado_com_ressalvas: '⚠️',
  reprovado: '❌',
  aguardar: '⏳',
}

export default function RecomendacaoCard({ recomendacao }: Props) {
  return (
    <div className={`card p-5 border-l-4 ${corDecisao[recomendacao.decisao] ?? 'border-gray-400 bg-gray-50'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{iconDecisao[recomendacao.decisao]}</span>
        <h3 className="font-semibold text-gray-900">Recomendação da IA</h3>
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{recomendacao.justificativa}</p>

      {(recomendacao.salario_sugerido != null || recomendacao.percentual_sugerido != null) && (
        <div className="flex gap-4 mb-4">
          {recomendacao.salario_sugerido != null && (
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-400">Salário sugerido</p>
              <p className="text-lg font-bold text-primary-700">
                {formatarMoeda(recomendacao.salario_sugerido)}
              </p>
            </div>
          )}
          {recomendacao.percentual_sugerido != null && (
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-400">Percentual sugerido</p>
              <p className="text-lg font-bold text-primary-700">
                {formatarPorcentagem(recomendacao.percentual_sugerido)}
              </p>
            </div>
          )}
        </div>
      )}

      {recomendacao.proximos_passos && recomendacao.proximos_passos.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Próximos passos
          </p>
          <ul className="space-y-1">
            {recomendacao.proximos_passos.map((passo, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">›</span>
                {passo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
