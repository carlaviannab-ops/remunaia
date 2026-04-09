interface Props {
  passoAtual: number
  totalPassos: number
  labels: string[]
}

export default function WizardProgress({ passoAtual, totalPassos, labels }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {labels.map((label, i) => {
        const num = i + 1
        const ativo = num === passoAtual
        const concluido = num < passoAtual
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  concluido
                    ? 'bg-primary-600 text-white'
                    : ativo
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {concluido ? '✓' : num}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap ${
                  ativo ? 'text-primary-600 font-medium' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < totalPassos - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mb-4 transition-colors ${
                  concluido ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
