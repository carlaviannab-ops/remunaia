import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { track, eventos } from '../lib/analytics'

const PIX_KEY = import.meta.env.VITE_PIX_KEY ?? ''
const WHATSAPP = import.meta.env.VITE_WHATSAPP ?? ''

const planos = [
  {
    id: 'starter',
    nome: 'Starter',
    preco: 'R$ 497',
    periodo: '/mês',
    descricao: 'Ideal para empresas com até 100 colaboradores',
    recursos: [
      '20 simulações/mês',
      '4 tipos de movimento',
      'Benchmark P25/P50/P75',
      'Análise de riscos',
      'Exportação PDF',
      'Suporte via WhatsApp',
    ],
    destaque: false,
    valor: 497,
  },
  {
    id: 'professional',
    nome: 'Professional',
    preco: 'R$ 1.297',
    periodo: '/mês',
    descricao: 'Para equipes de RH com uso intenso',
    recursos: [
      'Simulações ilimitadas',
      'Tudo do Starter',
      'Histórico completo',
      'Equidade interna avançada',
      'Relatórios em PDF',
      'Suporte prioritário',
    ],
    destaque: true,
    valor: 1297,
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
      'Múltiplos usuários',
      'Onboarding dedicado',
      'Relatórios customizados',
      'Gerente de conta',
    ],
    destaque: false,
    valor: 2997,
  },
]

export default function Planos() {
  const { profile } = useAuth()
  const [planoSelecionado, setPlanoSelecionado] = useState<(typeof planos)[0] | null>(null)
  const [copiado, setCopiado] = useState(false)

  function handleSolicitar(plano: (typeof planos)[0]) {
    track(eventos.UPGRADE_CLICADO, { plano: plano.id })
    setPlanoSelecionado(plano)
  }

  async function copiarChave() {
    await navigator.clipboard.writeText(PIX_KEY)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function abrirWhatsApp(plano: (typeof planos)[0]) {
    const texto = encodeURIComponent(
      `Olá! Quero assinar o plano ${plano.nome} do RemunaIA (${plano.preco}/mês). Segue o comprovante do PIX.`
    )
    window.open(`https://wa.me/55${WHATSAPP.replace(/\D/g, '')}?text=${texto}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Planos e Preços</h1>
        <p className="text-gray-500 text-sm mt-2">
          Pagamento via PIX · Ativação em até 1 hora útil
        </p>
      </div>

      {/* Cards de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map(plano => {
          const planoAtual = profile?.plano === plano.id
          return (
            <div
              key={plano.id}
              className={`card p-6 flex flex-col ${plano.destaque ? 'ring-2 ring-primary-600' : ''}`}
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
                  ✓ Plano atual
                </button>
              ) : (
                <button
                  onClick={() => handleSolicitar(plano)}
                  className={plano.destaque ? 'btn-primary' : 'btn-secondary'}
                >
                  Assinar via PIX
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de instruções PIX */}
      {planoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Como assinar o plano {planoSelecionado.nome}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Siga os passos abaixo para ativar sua assinatura
            </p>

            <div className="space-y-4">
              {/* Passo 1 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Faça o PIX</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Valor: <strong>{planoSelecionado.preco}/mês</strong>
                  </p>
                  {PIX_KEY && (
                    <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600 flex-1 font-mono truncate">{PIX_KEY}</span>
                      <button
                        onClick={copiarChave}
                        className="text-xs text-primary-600 font-medium whitespace-nowrap"
                      >
                        {copiado ? '✓ Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Passo 2 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Envie o comprovante</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Encaminhe via WhatsApp com seu e-mail de cadastro
                  </p>
                  {WHATSAPP && (
                    <button
                      onClick={() => abrirWhatsApp(planoSelecionado)}
                      className="mt-2 flex items-center gap-2 text-xs bg-green-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      <span>💬</span> Abrir WhatsApp
                    </button>
                  )}
                </div>
              </div>

              {/* Passo 3 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Aguarde a ativação</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Seu plano é ativado em até <strong>1 hora útil</strong> após confirmação do pagamento.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPlanoSelecionado(null)}
              className="mt-6 w-full btn-secondary"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Cancele a qualquer momento · Sem fidelidade · Suporte via WhatsApp
      </p>
    </div>
  )
}
