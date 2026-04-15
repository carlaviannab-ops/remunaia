import { useNavigate } from 'react-router-dom'
import { track, eventos } from '../lib/analytics'

const DIFERENCIAIS = [
  {
    icone: '📊',
    titulo: 'Benchmark P25 / P50 / P75',
    descricao: 'Comparativo de mercado com base em Mercer, WTW, Korn Ferry, Catho e dados do CAGED/IBGE. Fontes listadas em cada simulação.',
  },
  {
    icone: '💰',
    titulo: 'Total Rewards + Compa-ratio',
    descricao: 'Calcule o pacote completo (salário, VR, VT, saúde, PLR, bônus) e veja onde o colaborador está em relação ao mercado.',
  },
  {
    icone: '🔥',
    titulo: 'Flight Risk Score',
    descricao: 'Score 0–100 que cruza gap salarial, tempo no cargo e senioridade para prever o risco de perda nos próximos 6 meses.',
  },
  {
    icone: '💼',
    titulo: 'ROI de Retenção',
    descricao: 'Compare o custo do aumento com o custo de substituir o colaborador. Tenha o argumento financeiro para levar ao CFO.',
  },
  {
    icone: '🗺️',
    titulo: 'Roadmap Salarial Progressivo',
    descricao: 'Quando não é hora de aprovar, a IA gera um plano de 3 etapas com datas, valores e condições para o colaborador evoluir.',
  },
  {
    icone: '💬',
    titulo: 'Script de comunicação',
    descricao: 'Roteiro pronto para o gestor conduzir a conversa — aprovação, aprovação parcial ou negativa — personalizado com o cargo e os valores reais.',
  },
]

const TIPOS = [
  { tipo: 'Promoção', icone: '🚀', desc: 'Mudança de cargo e salário' },
  { tipo: 'Aumento Salarial', icone: '📈', desc: 'Reajuste no mesmo cargo' },
  { tipo: 'Nova Contratação', icone: '🤝', desc: 'Oferta para candidato externo' },
  { tipo: 'Ajuste de Faixa', icone: '⚖️', desc: 'Revisão de bandas salariais' },
]

const COMO_FUNCIONA = [
  { num: '1', titulo: 'Preencha os dados', desc: 'Cargo, salário atual, proposto, regime, setor e estado. Opcionalmente, benefícios.' },
  { num: '2', titulo: 'A IA analisa', desc: 'Em menos de 30 segundos, cruza com benchmark de mercado e gera a análise completa.' },
  { num: '3', titulo: 'Leve para o comitê', desc: 'Resultado com fontes, ROI, Flight Risk, script de comunicação e exportação PDF.' },
]

export default function Landing() {
  const navigate = useNavigate()

  function handleCTA(origem: string) {
    track(eventos.CADASTRO, { origem })
    navigate('/cadastro')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="text-xl font-bold text-primary-700">RemunaIA</div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-gray-900">
            Entrar
          </button>
          <button onClick={() => handleCTA('nav')} className="btn-primary text-sm">
            Começar grátis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          ✨ IA especialista em remuneração estratégica no Brasil
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Decida salários com dados,
          <br />
          <span className="text-primary-600">não com achismo</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Simule promoções, aumentos e contratações com benchmark de mercado, ROI de retenção,
          Flight Risk Score e script pronto para o gestor — em menos de 30 segundos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => handleCTA('hero')} className="btn-primary text-base px-8 py-3">
            Testar gratuitamente
          </button>
          <button onClick={() => navigate('/login')} className="btn-secondary text-base px-8 py-3">
            Já tenho conta
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">3 simulações grátis · Sem cartão de crédito</p>
      </section>

      {/* Tipos */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            4 tipos de simulação
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TIPOS.map(s => (
              <div key={s.tipo} className="card p-5 text-center">
                <div className="text-3xl mb-2">{s.icone}</div>
                <p className="font-semibold text-gray-900 text-sm">{s.tipo}</p>
                <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          O que nenhuma outra ferramenta faz
        </h2>
        <p className="text-center text-gray-500 text-sm mb-10 max-w-xl mx-auto">
          Além do benchmark padrão, o RemunaIA entrega o que o mercado ainda não tem.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {DIFERENCIAIS.map(b => (
            <div key={b.titulo} className="flex gap-4">
              <div className="text-2xl shrink-0">{b.icone}</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{b.titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">{b.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {COMO_FUNCIONA.map(p => (
              <div key={p.num} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {p.num}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{p.titulo}</h3>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preços resumo */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">Preços simples</h2>
        <p className="text-center text-gray-500 text-sm mb-8">Pagamento via PIX · Ativação em 1 hora útil · Cancele quando quiser</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { nome: 'Trial', preco: 'Grátis', desc: '3 simulações para testar', cta: false },
            { nome: 'Starter', preco: 'R$ 197/mês', desc: '20 simulações/mês', cta: false },
            { nome: 'Professional', preco: 'R$ 497/mês', desc: 'Ilimitado + todas as features', cta: true },
          ].map(p => (
            <div key={p.nome} className={`card p-5 text-center ${p.cta ? 'ring-2 ring-primary-500' : ''}`}>
              {p.cta && <p className="text-xs text-primary-600 font-semibold mb-2">Mais popular</p>}
              <p className="font-bold text-gray-900">{p.nome}</p>
              <p className="text-xl font-bold text-primary-700 my-1">{p.preco}</p>
              <p className="text-xs text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button onClick={() => navigate('/planos')} className="btn-secondary text-sm">
            Ver todos os planos e funcionalidades →
          </button>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Pronto para decidir salários com confiança?
          </h2>
          <p className="text-primary-100 mb-8">
            Comece com 3 simulações gratuitas. Sem cartão de crédito.
          </p>
          <button
            onClick={() => handleCTA('cta_final')}
            className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Criar conta grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-6 mb-3">
          <a href="/termos" className="hover:text-gray-600">Termos de Uso</a>
          <a href="/privacidade" className="hover:text-gray-600">Privacidade</a>
        </div>
        <p>© {new Date().getFullYear()} RemunaIA. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
