import type { FontePesquisa, TipoFonte } from '../../types'

interface Props {
  fontes: FontePesquisa[]
}

const TIPO_CONFIG: Record<TipoFonte, { label: string; cor: string }> = {
  pesquisa_salarial:    { label: 'Pesquisa Salarial',     cor: 'bg-blue-50 text-blue-700 border-blue-200' },
  dados_governamentais: { label: 'Dados Governamentais',  cor: 'bg-green-50 text-green-700 border-green-200' },
  portal_empregos:      { label: 'Portal de Empregos',    cor: 'bg-purple-50 text-purple-700 border-purple-200' },
  consultoria:          { label: 'Consultoria',           cor: 'bg-orange-50 text-orange-700 border-orange-200' },
  associacao_setorial:  { label: 'Associação Setorial',   cor: 'bg-teal-50 text-teal-700 border-teal-200' },
}

export default function FontesPesquisaCard({ fontes }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-gray-900">Fontes da Pesquisa Salarial</h3>
        <span className="text-xs text-gray-400 mt-0.5">{fontes.length} referências</span>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Os valores de benchmark foram estimados com base nas fontes abaixo. Os dados são estimativas de referência — para decisões críticas, consulte as pesquisas originais diretamente.
      </p>

      <div className="space-y-3">
        {fontes.map((f, i) => {
          const cfg = TIPO_CONFIG[f.tipo] ?? TIPO_CONFIG.consultoria
          return (
            <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm leading-snug">{f.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.organizacao} · {f.ano_referencia}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.cor}`}>
                  {cfg.label}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-1">
                <span className="font-medium text-gray-600">Cobertura:</span> {f.cobertura}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                <span className="font-medium text-gray-600">Relevância:</span> {f.relevancia}
              </p>

              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Acessar fonte oficial
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2">
        <svg className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-gray-400 leading-relaxed">
          Os valores de P25, P50 e P75 são estimativas geradas por IA com base no conhecimento das pesquisas listadas. Para acesso aos dados originais e metodologia completa, consulte cada fonte diretamente. Pesquisas como Mercer TRS e WTW são pagas e acessadas por assinatura corporativa.
        </p>
      </div>
    </div>
  )
}
