import type { FormularioSimulacao } from '../../types'

interface Props {
  dados: Partial<FormularioSimulacao>
  onChange: (campo: keyof FormularioSimulacao, valor: string | number) => void
  onSubmit: () => void
  onVoltar: () => void
  loading: boolean
}

export default function Passo3Contexto({ dados, onChange, onSubmit, onVoltar, loading }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Contexto e justificativa</h2>
      <p className="text-sm text-gray-500 mb-6">
        Forneça contexto para a IA gerar recomendações mais precisas
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="label">Justificativa do movimento</label>
          <textarea
            className="input min-h-[90px] resize-none"
            placeholder="Ex: Colaboradora assumiu novas responsabilidades e liderou projeto estratégico com resultado acima do esperado."
            value={dados.justificativa ?? ''}
            onChange={e => onChange('justificativa', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Porte da empresa</label>
          <select
            className="input"
            value={dados.porte_empresa ?? ''}
            onChange={e => onChange('porte_empresa', e.target.value)}
          >
            <option value="">Selecione (opcional)</option>
            <option value="startup">Startup (até 50 funcionários)</option>
            <option value="pequena">Pequena (50–200 funcionários)</option>
            <option value="media">Média (200–1.000 funcionários)</option>
            <option value="grande">Grande (1.000+ funcionários)</option>
          </select>
        </div>

        <div>
          <label className="label">Setor / Indústria</label>
          <input
            className="input"
            placeholder="Ex: Tecnologia, Varejo, Saúde..."
            value={dados.setor ?? ''}
            onChange={e => onChange('setor', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Informações adicionais</label>
          <textarea
            className="input min-h-[70px] resize-none"
            placeholder="Ex: Empresa passa por processo de expansão, orçamento de RH limitado este ano."
            value={dados.contexto_adicional ?? ''}
            onChange={e => onChange('contexto_adicional', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onVoltar} className="btn-secondary" disabled={loading}>
          ← Voltar
        </button>
        <button onClick={onSubmit} disabled={loading} className="btn-primary disabled:opacity-40 flex items-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analisando com IA...
            </>
          ) : (
            '✨ Gerar Simulação'
          )}
        </button>
      </div>
    </div>
  )
}
