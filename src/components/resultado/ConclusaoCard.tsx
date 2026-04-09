interface Props {
  conclusao: string
  onExportarPDF: () => void
  onNovaSimulacao: () => void
  exportando: boolean
}

export default function ConclusaoCard({ conclusao, onExportarPDF, onNovaSimulacao, exportando }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-3">Conclusão</h3>
      <p className="text-sm text-gray-700 leading-relaxed mb-6">{conclusao}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onExportarPDF}
          disabled={exportando}
          className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {exportando ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Gerando PDF...
            </>
          ) : (
            <>📄 Exportar PDF</>
          )}
        </button>
        <button onClick={onNovaSimulacao} className="btn-primary">
          ➕ Nova Simulação
        </button>
      </div>
    </div>
  )
}
