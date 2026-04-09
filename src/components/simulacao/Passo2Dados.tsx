import type { FormularioSimulacao, TipoMovimento, Regime } from '../../types'

interface Props {
  tipo: TipoMovimento
  dados: Partial<FormularioSimulacao>
  onChange: (campo: keyof FormularioSimulacao, valor: string | number) => void
  onProximo: () => void
  onVoltar: () => void
}

export default function Passo2Dados({ tipo, dados, onChange, onProximo, onVoltar }: Props) {
  const ehContratacao = tipo === 'nova_contratacao'

  const camposValidos = () => {
    if (!dados.cargo || !dados.nivel || !dados.regime) return false
    if (!ehContratacao && !dados.salario_atual) return false
    if (tipo === 'promocao' && !dados.nivel_proposto) return false
    if (tipo === 'aumento_salarial' && !dados.percentual_aumento) return false
    if (tipo === 'ajuste_faixa' && (!dados.faixa_minima || !dados.faixa_maxima)) return false
    return true
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Dados da simulação</h2>
      <p className="text-sm text-gray-500 mb-6">Preencha as informações do colaborador e do cargo</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {!ehContratacao && (
          <div>
            <label className="label">Nome do colaborador</label>
            <input
              className="input"
              placeholder="Ex: Maria Silva"
              value={dados.colaborador ?? ''}
              onChange={e => onChange('colaborador', e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="label">Cargo *</label>
          <input
            className="input"
            placeholder="Ex: Analista de RH"
            value={dados.cargo ?? ''}
            onChange={e => onChange('cargo', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Nível atual *</label>
          <select
            className="input"
            value={dados.nivel ?? ''}
            onChange={e => onChange('nivel', e.target.value)}
          >
            <option value="">Selecione...</option>
            {['Junior', 'Pleno', 'Senior', 'Especialista', 'Coordenador', 'Gerente', 'Diretor'].map(n => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Regime *</label>
          <select
            className="input"
            value={dados.regime ?? ''}
            onChange={e => onChange('regime', e.target.value as Regime)}
          >
            <option value="">Selecione...</option>
            <option value="clt">CLT</option>
            <option value="pj">PJ</option>
          </select>
        </div>

        {!ehContratacao && (
          <div>
            <label className="label">Salário atual (R$) *</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="Ex: 5000"
              value={dados.salario_atual ?? ''}
              onChange={e => onChange('salario_atual', Number(e.target.value))}
            />
          </div>
        )}

        {tipo === 'promocao' && (
          <div>
            <label className="label">Nível proposto *</label>
            <select
              className="input"
              value={dados.nivel_proposto ?? ''}
              onChange={e => onChange('nivel_proposto', e.target.value)}
            >
              <option value="">Selecione...</option>
              {['Pleno', 'Senior', 'Especialista', 'Coordenador', 'Gerente', 'Diretor'].map(n => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
        )}

        {tipo === 'aumento_salarial' && (
          <div>
            <label className="label">Percentual de aumento (%) *</label>
            <input
              className="input"
              type="number"
              min={0}
              max={100}
              placeholder="Ex: 15"
              value={dados.percentual_aumento ?? ''}
              onChange={e => onChange('percentual_aumento', Number(e.target.value))}
            />
          </div>
        )}

        {tipo === 'ajuste_faixa' && (
          <>
            <div>
              <label className="label">Faixa mínima (R$) *</label>
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Ex: 4000"
                value={dados.faixa_minima ?? ''}
                onChange={e => onChange('faixa_minima', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Faixa máxima (R$) *</label>
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Ex: 8000"
                value={dados.faixa_maxima ?? ''}
                onChange={e => onChange('faixa_maxima', Number(e.target.value))}
              />
            </div>
          </>
        )}

        <div>
          <label className="label">Área / Departamento</label>
          <input
            className="input"
            placeholder="Ex: Recursos Humanos"
            value={dados.area ?? ''}
            onChange={e => onChange('area', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Localização</label>
          <input
            className="input"
            placeholder="Ex: São Paulo, SP"
            value={dados.localizacao ?? ''}
            onChange={e => onChange('localizacao', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onVoltar} className="btn-secondary">← Voltar</button>
        <button onClick={onProximo} disabled={!camposValidos()} className="btn-primary disabled:opacity-40">
          Próximo →
        </button>
      </div>
    </div>
  )
}
