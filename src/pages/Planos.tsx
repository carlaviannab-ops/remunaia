import { useAuth } from '../hooks/useAuth'
import { track, eventos } from '../lib/analytics'

const planos = [
  {
    id: 'starter',
    nome: 'Starter',
    preco: 'R$ 497',
    periodo: '/mês',
    descricao: 'Ideal para empresas com até 100 colaboradores',
    recursos: [
      '30 simulações/mês',
      '4 tipos de movimento',
      'Benchmark P25/P50/P75',
      'Análise de riscos',
      'Exportação PDF',
      'Suporte por email',
    ],
    destaque: false,
    linkEnv: 'VITE_STRIPE_STARTER_LINK',
  },
  {
    id: 'professional',
    nome: 'Professional',
    preco: 'R$ 1.297',
    periodo: '/mês',
    descricao: 'Para equipes de RH com múltiplos usuários',
    recursos: [
      '150 simulações/mês',
      'Tudo do Starter',
      '3 usuários simultâneos',
      'Equidade interna avançada',
      'Histórico ilimitado',
      'Suporte prioritário',
    ],
    destaque: true,
    linkEnv: 'VITE_STRIPE_PROFESSIONAL_LINK',
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 'R$ 2.997',
    periodo: '/mês',
    descricao: 'Para grandes organizações e consultorias',
    recursos: [
      'Simulações ilimitadas',
      'Tudo do Professional',
      'Usuários ilimitados',
      'API de integração',
      'Relatórios customizados',
      'Gerente de conta dedicado',
    ],
    destaque: false,
    linkEnv: 'VITE_STRIPE_ENTERPRISE_LINK',
  },
]

export default function Planos() {
  const { profile } = useAuth()

  function handleAssinar(planoId: string) {
    const linkMap: Record<string, string> = {
      starter: import.meta.env.VITE_STRIPE_STARTER_LINK,
      professional: import.meta.env.VITE_STRIPE_PROFESSIONAL_LINK,
      enterprise: import.meta.env.VITE_STRIPE_ENTERPRISE_LINK,
    }
    const url = linkMap[planoId]
    if (url) {
      track(eventos.planoSelecionado, { plano: planoId })
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Planos e Preços</h1>
        <p className="text-gray-500 text-sm mt-2">
          Escolha o plano ideal para sua equipe
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map(plano => {
          const planoAtual = profile?.plano === plano.id
          return (
            <div
              key={plano.id}
              className={`card p-6 flex flex-col ${
                plano.destaque ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              {plano.destaque && (
                <div className="text-center mb-4">
                  <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Mais popular
                  </span>
                </div>
              )}
              <h2 className="text-lg font-bold text-gray-900">{plano.nome}</h2>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-bold text-primary-700">{plano.preco}</span>
                <span className="text-gray-400 text-sm">{plano.periodo}</span>
              </div>
              <p className="text-sm text-gray-500 mb-5">{plano.descricao}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plano.recursos.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {r}
                  </li>
                ))}
              </ul>

              {planoAtual ? (
                <button disabled className="btn-secondary opacity-60 cursor-not-allowed">
                  Plano atual
                </button>
              ) : (
                <button
                  onClick={() => handleAssinar(plano.id)}
                  className={plano.destaque ? 'btn-primary' : 'btn-secondary'}
                >
                  Assinar {plano.nome}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        Pagamento seguro via Stripe · Cancele a qualquer momento · 7 dias de garantia
      </p>
    </div>
  )
}
