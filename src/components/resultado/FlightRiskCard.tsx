import type { FlightRisk } from '../../types'

interface Props {
  flightRisk: FlightRisk
}

const NIVEL_CONFIG = {
  baixo:    { label: 'Risco Baixo',    cor: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200', gauge: 'bg-green-500',  desc: 'Colaborador estável no curto prazo.' },
  moderado: { label: 'Risco Moderado', cor: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200',gauge: 'bg-yellow-400', desc: 'Atenção: sinais de insatisfação podem surgir.' },
  alto:     { label: 'Risco Alto',     cor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200',gauge: 'bg-orange-500', desc: 'Perda provável nos próximos 6 meses sem ação.' },
  critico:  { label: 'Risco Crítico',  cor: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   gauge: 'bg-red-600',    desc: 'Risco imediato de desligamento voluntário.' },
}

const FATORES_LABEL: Record<string, string> = {
  gap_salarial:    'Gap salarial vs. mercado',
  tempo_cargo:     'Tempo sem reajuste',
  senioridade:     'Perfil e senioridade',
  demanda_mercado: 'Demanda do mercado',
}

export default function FlightRiskCard({ flightRisk: fr }: Props) {
  const cfg = NIVEL_CONFIG[fr.nivel] ?? NIVEL_CONFIG.moderado
  const pct = Math.min(100, Math.max(0, fr.score))

  return (
    <div className={`card p-5 border ${cfg.border}`}>
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">Score de Risco de Perda</h3>
          <p className="text-xs text-gray-400 mt-0.5">Probabilidade de desligamento voluntário nos próximos 6 meses</p>
        </div>
        <div className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.cor} border ${cfg.border}`}>
          {cfg.label}
        </div>
      </div>

      {/* Gauge */}
      <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
        <span>0</span>
        <span className={`text-2xl font-bold ${cfg.cor}`}>{fr.score}<span className="text-sm font-medium">/100</span></span>
        <span>100</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all ${cfg.gauge}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mb-5 italic">{cfg.desc}</p>

      {/* Fatores */}
      <div className="space-y-2.5 mb-4">
        {Object.entries(fr.fatores).map(([key, valor]) => (
          <div key={key} className="flex items-start gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.gauge}`} />
            <div>
              <span className="text-xs font-medium text-gray-600">{FATORES_LABEL[key] ?? key}: </span>
              <span className="text-xs text-gray-500">{valor}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo */}
      <div className={`rounded-xl p-3 text-sm leading-relaxed ${cfg.bg} ${cfg.cor}`}>
        {fr.resumo}
      </div>
    </div>
  )
}
