import type { FormularioSimulacao, TipoMovimento } from '../../types'

interface Props {
  tipo: TipoMovimento
  dados: Partial<FormularioSimulacao>
  onChange: (campo: keyof FormularioSimulacao, valor: string | number | boolean) => void
  onSubmit: () => void
  onVoltar: () => void
  loading: boolean
}

function config(tipo: TipoMovimento) {
  switch (tipo) {
    case 'promocao': return {
      labelHistorico: 'Histórico e desempenho do colaborador',
      placeholderHistorico: 'Ex: Avaliações de desempenho, projetos liderados, tempo na empresa, resultados entregues...',
      mostrarHistorico: true,
      mostrarPolitica: true,
      labelPares: 'Existem outros colaboradores no cargo atual?',
      labelSalarioPares: 'Salário médio dos pares no cargo atual (R$)',
    }
    case 'aumento': return {
      labelHistorico: 'Justificativa e histórico do colaborador',
      placeholderHistorico: 'Ex: Mérito por desempenho, tempo sem reajuste, inflação acumulada, nova responsabilidade assumida...',
      mostrarHistorico: true,
      mostrarPolitica: true,
      labelPares: 'Existem pares neste cargo?',
      labelSalarioPares: 'Salário médio dos pares (R$)',
    }
    case 'contratacao': return {
      labelHistorico: 'Perfil buscado e requisitos do cargo',
      placeholderHistorico: 'Ex: Experiência mínima esperada, formação, competências técnicas, soft skills exigidos...',
      mostrarHistorico: true,
      mostrarPolitica: false,
      labelPares: 'Existem colaboradores no mesmo cargo na empresa?',
      labelSalarioPares: 'Salário médio interno para este cargo (R$)',
    }
    case 'ajuste_faixa': return {
      labelHistorico: 'Motivo do ajuste de faixa',
      placeholderHistorico: 'Ex: Defasagem em relação ao mercado, atração e retenção comprometidas, reestruturação de carreira...',
      mostrarHistorico: true,
      mostrarPolitica: true,
      labelPares: 'Existem cargos similares no mercado como referência?',
      labelSalarioPares: 'Salário de mercado de referência (R$)',
    }
  }
}

export default function Passo3Contexto({ tipo, dados, onChange, onSubmit, onVoltar, loading }: Props) {
  const cfg = config(tipo)

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Contexto e justificativa</h2>
      <p className="text-sm text-gray-500 mb-6">
        Forneça contexto para a IA gerar recomendações mais precisas
      </p>

      <div className="space-y-4 mb-8">

        {/* Histórico / perfil / motivo — label dinâmico por tipo */}
        {cfg.mostrarHistorico && (
          <div>
            <label className="label">{cfg.labelHistorico}</label>
            <textarea
              className="input min-h-[90px] resize-none"
              placeholder={cfg.placeholderHistorico}
              value={dados.historico_avaliacao ?? ''}
              onChange={e => onChange('historico_avaliacao', e.target.value)}
            />
          </div>
        )}

        {/* Política salarial — oculta em contratação */}
        {cfg.mostrarPolitica && (
          <div>
            <label className="label">Política salarial da empresa</label>
            <input
              className="input"
              placeholder="Ex: Reajuste anual pelo IPCA + mérito de até 10%"
              value={dados.politica_salarial ?? ''}
              onChange={e => onChange('politica_salarial', e.target.value)}
            />
          </div>
        )}

        {/* Pares / cargos similares */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{cfg.labelPares}</label>
            <select
              className="input"
              value={dados.pares_existem ? 'sim' : 'nao'}
              onChange={e => onChange('pares_existem', e.target.value === 'sim')}
            >
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>

          {dados.pares_existem && (
            <div>
              <label className="label">{cfg.labelSalarioPares}</label>
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Ex: 7000"
                value={dados.salario_medio_pares ?? ''}
                onChange={e => onChange('salario_medio_pares', Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Há budget aprovado?</label>
            <select
              className="input"
              value={dados.budget_informado ? 'sim' : 'nao'}
              onChange={e => onChange('budget_informado', e.target.value === 'sim')}
            >
              <option value="nao">Não / não sei</option>
              <option value="sim">Sim</option>
            </select>
          </div>

          {dados.budget_informado && (
            <div>
              <label className="label">Valor do budget (R$)</label>
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Ex: 8000"
                value={dados.budget_valor ?? ''}
                onChange={e => onChange('budget_valor', Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Contexto adicional */}
        <div>
          <label className="label">Informações adicionais</label>
          <textarea
            className="input min-h-[70px] resize-none"
            placeholder="Ex: Empresa em expansão, orçamento de RH limitado, mercado aquecido para este cargo..."
            value={dados.contexto_adicional ?? ''}
            onChange={e => onChange('contexto_adicional', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onVoltar} className="btn-secondary" disabled={loading}>
          ← Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="btn-primary disabled:opacity-40 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analisando com IA...
            </>
          ) : '✨ Gerar Simulação'}
        </button>
      </div>
    </div>
  )
}
