export default function Termos() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <a href="/" className="text-sm text-primary-600 hover:underline">← Voltar</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: abril de 2025</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta ou utilizar o RemunaIA ("Serviço"), você concorda integralmente com estes Termos de Uso. Se não concordar, não utilize o Serviço.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Descrição do Serviço</h2>
            <p>O RemunaIA é uma plataforma de simulação e análise de remuneração estratégica que utiliza inteligência artificial para gerar análises de benchmark salarial, equidade interna, riscos e recomendações para profissionais de Recursos Humanos no Brasil.</p>
            <p className="mt-2">Os dados e análises fornecidos são estimativas baseadas em fontes de mercado de referência e não constituem assessoria jurídica, contábil ou financeira. As decisões finais são de responsabilidade exclusiva do usuário.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Cadastro e Conta</h2>
            <p>Para usar o Serviço, você deve criar uma conta fornecendo informações verídicas. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas em sua conta.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Planos e Pagamentos</h2>
            <p>O RemunaIA oferece planos gratuitos (trial com 3 simulações) e pagos (Starter e Professional). Os pagamentos são realizados via PIX e ativados em até 1 hora útil após confirmação do comprovante enviado via WhatsApp.</p>
            <p className="mt-2">Não há contrato de fidelidade. O cancelamento pode ser solicitado a qualquer momento via WhatsApp, com efeito a partir do próximo período de cobrança.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Uso Aceitável</h2>
            <p>Você concorda em usar o Serviço apenas para fins legais e profissionais. É proibido: (a) inserir dados falsos ou de terceiros sem autorização; (b) tentar acessar sistemas ou dados de outros usuários; (c) fazer engenharia reversa da plataforma; (d) revender o acesso sem autorização expressa.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Precisão dos Dados</h2>
            <p>Os benchmarks salariais gerados são estimativas com base em dados de pesquisas de referência (Mercer, WTW, Korn Ferry, CAGED, RAIS e outros) e no conhecimento do modelo de inteligência artificial. <strong>Os valores não representam dados reais das pesquisas originais</strong>, que são propriedade de seus respectivos detentores e acessíveis por assinatura separada.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Propriedade Intelectual</h2>
            <p>O RemunaIA, incluindo sua interface, prompts, metodologia e código, é de propriedade exclusiva do RemunaIA. O usuário recebe uma licença limitada, não exclusiva e intransferível para uso do Serviço.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Limitação de Responsabilidade</h2>
            <p>O Serviço é fornecido "como está". O RemunaIA não se responsabiliza por decisões tomadas com base nas análises geradas, por perdas diretas ou indiretas decorrentes do uso ou indisponibilidade do Serviço.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. Rescisão</h2>
            <p>O RemunaIA pode suspender ou encerrar contas que violem estes Termos, com notificação prévia sempre que possível.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">10. Legislação Aplicável</h2>
            <p>Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de Curitiba/PR para dirimir quaisquer disputas.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">11. Contato</h2>
            <p>Dúvidas sobre estes Termos: <a href="mailto:carla.viannab@gmail.com" className="text-primary-600 hover:underline">carla.viannab@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
