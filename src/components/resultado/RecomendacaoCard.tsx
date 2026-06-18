import { formatarMoeda } from '../../lib/utils'
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

const corUrgencia: Record<string, string> = {
  imediata: 'text-red-600 bg-red-50',
  'pode aguardar': 'text-yellow-600 bg-yellow-50',
  'nao recomendado agora': 'text-gray-600 bg-gray-100',
}

export default function RecomendacaoCard({ recomendacao }: Props) {
  const decisaoKey = recomendacao.decisao?.toLowerCase().replace(/ /g, '_') ?? ''

  return (
    <div className={`card p-5 border-l-4 ${corDecisao[decisaoKey] ?? 'border-gray-400 bg-gray-50'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{iconDecisao[decisaoKey] ?? '📋'}</span>
        <h3 className="font-semibold text-gray-900">Recomendação da IA</h3>
        {recomendacao.urgencia && (
          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${corUrgencia[recomendacao.urgencia] ?? 'text-gray-600 bg-gray-100'}`}>
            {recomendacao.urgencia === 'imediata' ? 'Urgente' : recomendacao.urgencia === 'pode aguardar' ? 'Pode aguardar' : 'Não recomendado agora'}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{recomendacao.justificativa}</p>

      {recomendacao.salario_recomendado != null && (
        <div className="flex gap-4 mb-4">
          <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400">Salário recomendado</p>
            <p className="text-lg font-bold text-primary-700">
              {formatarMoeda(recomendacao.salario_recomendado)}
            </p>
          </div>
        </div>
      )}

      {recomendacao.condicoes && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Condições
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{recomendacao.condicoes}</p>
        </div>
      )}
    </div>
  )
}
