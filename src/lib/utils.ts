// Formatar valor monetário em R$
export const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

// Formatar percentual
export const formatarPorcentagem = (valor: number): string =>
  `${valor > 0 ? '+' : ''}${valor.toFixed(1)}%`

// Formatar data
export const formatarData = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// Label legível para tipo de movimento
export const labelTipo: Record<string, string> = {
  promocao:     'Promoção',
  aumento:      'Aumento Salarial',
  contratacao:  'Nova Contratação',
  ajuste_faixa: 'Ajuste de Faixa',
}

// Label legível para regime
export const labelRegime: Record<string, string> = {
  clt: 'CLT',
  pj:  'PJ',
}

// Cor do badge de risco
export const corRisco: Record<string, string> = {
  baixo: 'bg-green-100 text-green-800',
  medio: 'bg-yellow-100 text-yellow-800',
  alto:  'bg-red-100 text-red-800',
}

// Cor do badge de urgência
export const corUrgencia: Record<string, string> = {
  'imediata':             'bg-blue-100 text-blue-800',
  'pode aguardar':        'bg-gray-100 text-gray-800',
  'não recomendado agora':'bg-red-100 text-red-800',
}

// Limite de simulações por plano
export const limiteSimulacoes: Record<string, number> = {
  trial:        3,
  starter:      20,
  professional: 999999,
  enterprise:   999999,
  cancelado:    0,
}
