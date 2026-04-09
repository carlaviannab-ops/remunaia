import { formatarMoeda } from '../../lib/utils'
import type { BenchmarkMercado } from '../../types'

interface Props {
  benchmark: BenchmarkMercado
  salarioAtual?: number
  salarioProposto?: number
}

function posicaoNoRange(valor: number, min: number, max: number) {
  if (max === min) return 50
  return Math.min(100, Math.max(0, ((valor - min) / (max - min)) * 100))
}

export default function BenchmarkBar({ benchmark, salarioAtual, salarioProposto }: Props) {
  const { p25, p50, p75, fonte } = benchmark
  const min = p25 * 0.85
  const max = p75 * 1.15

  const marcadores = [
    { label: 'P25', valor: p25, cor: 'bg-yellow-400' },
    { label: 'P50', valor: p50, cor: 'bg-green-500' },
    { label: 'P75', valor: p75, cor: 'bg-blue-500' },
  ]

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Benchmark de Mercado</h3>
        <span className="text-xs text-gray-400">{fonte}</span>
      </div>

      {/* Barra de percentis */}
      <div className="relative h-6 bg-gray-100 rounded-full mb-2">
        <div
          className="absolute h-full bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 rounded-full"
          style={{
            left: `${posicaoNoRange(p25, min, max)}%`,
            width: `${posicaoNoRange(p75, min, max) - posicaoNoRange(p25, min, max)}%`,
          }}
        />
        {marcadores.map(m => (
          <div
            key={m.label}
            className="absolute top-0 h-full flex items-center"
            style={{ left: `${posicaoNoRange(m.valor, min, max)}%` }}
          >
            <div className={`w-0.5 h-full ${m.cor}`} />
          </div>
        ))}
        {salarioAtual != null && (
          <div
            className="absolute top-0 h-full flex items-center"
            style={{ left: `${posicaoNoRange(salarioAtual, min, max)}%` }}
          >
            <div className="w-3 h-3 rounded-full bg-gray-600 border-2 border-white -translate-x-1.5" />
          </div>
        )}
        {salarioProposto != null && (
          <div
            className="absolute top-0 h-full flex items-center"
            style={{ left: `${posicaoNoRange(salarioProposto, min, max)}%` }}
          >
            <div className="w-3 h-3 rounded-full bg-primary-600 border-2 border-white -translate-x-1.5" />
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>{formatarMoeda(min)}</span>
        <span>{formatarMoeda(max)}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {marcadores.map(m => (
          <div key={m.label} className="text-center">
            <div className={`w-3 h-3 rounded-full ${m.cor} mx-auto mb-1`} />
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className="text-sm font-semibold text-gray-900">{formatarMoeda(m.valor)}</p>
          </div>
        ))}
      </div>

      {(salarioAtual != null || salarioProposto != null) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs">
          {salarioAtual != null && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
              <span className="text-gray-500">Atual: {formatarMoeda(salarioAtual)}</span>
            </div>
          )}
          {salarioProposto != null && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
              <span className="text-gray-500">Proposto: {formatarMoeda(salarioProposto)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
