import type { FormularioSimulacao, TipoMovimento, Regime, NivelSenioridade } from '../../types'

interface Props {
  tipo: TipoMovimento
  dados: Partial<FormularioSimulacao>
  onChange: (campo: keyof FormularioSimulacao, valor: string | number | boolean) => void
  onProximo: () => void
  onVoltar: () => void
}

const niveis: NivelSenioridade[] = ['junior', 'pleno', 'senior', 'especialista', 'lideranca']
const niveisLabel: Record<NivelSenioridade, string> = {
  junior: 'Júnior', pleno: 'Pleno', senior: 'Sênior', especialista: 'Especialista', lideranca: 'Liderança',
}

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

function config(tipo: TipoMovimento) {
  switch (tipo) {
    case 'promocao': return {
      labelCargo: 'Cargo atual *',
      placeholderCargo: 'Ex: Analista de RH',
      labelSalarioAtual: 'Salário atual (R$) *',
      labelSalarioProposto: 'Novo salário proposto (R$) *',
      mostrarCargoAtual: true,
      mostrarCargoProposto: true,
      mostrarSalarioAtual: true,
      mostrarTempoCargo: true,
    }
    case 'aumento': return {
      labelCargo: 'Cargo *',
      placeholderCargo: 'Ex: Analista de RH',
      labelSalarioAtual: 'Salário atual (R$) *',
      labelSalarioProposto: 'Novo salário proposto (R$) *',
      mostrarCargoAtual: true,
      mostrarCargoProposto: false,
      mostrarSalarioAtual: true,
      mostrarTempoCargo: true,
    }
    case 'contratacao': return {
      labelCargo: 'Cargo a contratar *',
      placeholderCargo: 'Ex: Engenheiro de Software',
      labelSalarioAtual: '',
      labelSalarioProposto: 'Oferta salarial (R$) *',
      mostrarCargoAtual: true,
      mostrarCargoProposto: false,
      mostrarSalarioAtual: false,
      mostrarTempoCargo: false,
    }
    case 'ajuste_faixa': return {
      labelCargo: 'Cargo / grupo de cargos *',
      placeholderCargo: 'Ex: Analista de TI (todos os níveis)',
      labelSalarioAtual: 'Faixa atual — midpoint (R$) *',
      labelSalarioProposto: 'Nova faixa proposta — midpoint (R$) *',
      mostrarCargoAtual: true,
      mostrarCargoProposto: false,
      mostrarSalarioAtual: true,
      mostrarTempoCargo: false,
    }
  }
}

export default function Passo2Dados({ tipo, dados, onChange, onProximo, onVoltar }: Props) {
  const cfg = config(tipo)

  const camposValidos = () => {
    if (!dados.cargo_atual || !dados.regime || !dados.setor || !dados.estado) return false
    if (cfg.mostrarSalarioAtual && !dados.salario_atual) return false
    if (!dados.salario_proposto) return false
    if (tipo === 'promocao' && !dados.cargo_proposto) return false
    return true
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Dados da simulação</h2>
      <p className="text-sm text-gray-500 mb-6">Preencha as informações do cargo</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

        {/* Cargo atual / a contratar */}
        <div className={tipo === 'ajuste_faixa' ? 'sm:col-span-2' : ''}>
          <label className="label">{cfg.labelCargo}</label>
          <input
            className="input"
            placeholder={cfg.placeholderCargo}
            value={dados.cargo_atual ?? ''}
            onChange={e => onChange('cargo_atual', e.target.value)}
          />
        </div>

        {/* Cargo proposto — só promoção */}
        {cfg.mostrarCargoProposto && (
          <div>
            <label className="label">Cargo proposto *</label>
            <input
              className="input"
              placeholder="Ex: Coordenador de RH"
              value={dados.cargo_proposto ?? ''}
              onChange={e => onChange('cargo_proposto', e.target.value)}
            />
          </div>
        )}

        {/* Regime */}
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

        {/* Salário atual — oculto em contratação */}
        {cfg.mostrarSalarioAtual && (
          <div>
            <label className="label">{cfg.labelSalarioAtual}</label>
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

        {/* Salário proposto */}
        <div>
          <label className="label">{cfg.labelSalarioProposto}</label>
          <input
            className="input"
            type="number"
            min={0}
            placeholder="Ex: 6000"
            value={dados.salario_proposto ?? ''}
            onChange={e => onChange('salario_proposto', Number(e.target.value))}
          />
        </div>

        {/* Setor */}
        <div>
          <label className="label">Setor *</label>
          <input
            className="input"
            placeholder="Ex: Tecnologia, Varejo, Saúde..."
            value={dados.setor ?? ''}
            onChange={e => onChange('setor', e.target.value)}
          />
        </div>

        {/* Estado */}
        <div>
          <label className="label">Estado *</label>
          <select
            className="input"
            value={dados.estado ?? ''}
            onChange={e => onChange('estado', e.target.value)}
          >
            <option value="">Selecione...</option>
            {UFS.map(uf => <option key={uf}>{uf}</option>)}
          </select>
        </div>

        {/* Nível de senioridade */}
        <div>
          <label className="label">Nível de senioridade</label>
          <select
            className="input"
            value={dados.nivel_senioridade ?? ''}
            onChange={e => onChange('nivel_senioridade', e.target.value as NivelSenioridade)}
          >
            <option value="">Selecione (opcional)</option>
            {niveis.map(n => (
              <option key={n} value={n}>{niveisLabel[n]}</option>
            ))}
          </select>
        </div>

        {/* Tempo no cargo — só promoção e aumento */}
        {cfg.mostrarTempoCargo && (
          <div>
            <label className="label">Tempo no cargo</label>
            <input
              className="input"
              placeholder="Ex: 2 anos"
              value={dados.tempo_cargo ?? ''}
              onChange={e => onChange('tempo_cargo', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Benefícios — Total Rewards (não aparece em ajuste_faixa) */}
      {tipo !== 'ajuste_faixa' && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Benefícios (opcional)</h3>
          <p className="text-xs text-gray-400 mb-4">Informe para calcular o pacote Total Rewards completo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Vale-refeição / alimentação (R$/mês)</label>
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Ex: 600"
                value={dados.vr_mensal ?? ''}
                onChange={e => onChange('vr_mensal', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Vale-transporte (R$/mês)</label>
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Ex: 200"
                value={dados.vt_mensal ?? ''}
                onChange={e => onChange('vt_mensal', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Plano de saúde — custo empresa (R$/mês)</label>
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Ex: 500"
                value={dados.plano_saude_mensal ?? ''}
                onChange={e => onChange('plano_saude_mensal', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">PLR (número de salários)</label>
              <input
                className="input"
                type="number"
                min={0}
                max={12}
                step={0.5}
                placeholder="Ex: 1.5 = 1,5 salário"
                value={dados.plr_multiplo ?? ''}
                onChange={e => onChange('plr_multiplo', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Bônus target (número de salários)</label>
              <input
                className="input"
                type="number"
                min={0}
                max={12}
                step={0.5}
                placeholder="Ex: 2 = 2 salários"
                value={dados.bonus_multiplo ?? ''}
                onChange={e => onChange('bonus_multiplo', Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onVoltar} className="btn-secondary">← Voltar</button>
        <button onClick={onProximo} disabled={!camposValidos()} className="btn-primary disabled:opacity-40">
          Próximo →
        </button>
      </div>
    </div>
  )
}
