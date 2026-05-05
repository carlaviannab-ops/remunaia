export const config = { runtime: 'edge' }

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const THEMES = [
  'dor_rh_manual',
  'benchmark_salarios',
  'ia_transformando_rh',
  'funcionalidade_remunaia',
  'dado_mercado',
  'pergunta_engajamento',
] as const

type Theme = typeof THEMES[number]

const PROMPTS: Record<Theme, string> = {
  dor_rh_manual: `
Você é o copywriter da RemunaIA, uma plataforma de IA para decisões de remuneração no Brasil.
Crie um post para LinkedIn em português, tom profissional e empático, para a página da empresa.

Tema: A dor real do profissional de RH com processos manuais de remuneração (planilhas, achismo, pressão da liderança).
Objetivo: Gerar identificação imediata com gestores de RH e apresentar a RemunaIA como a solução.

Regras:
- Comece com uma situação ou frase que gere identificação imediata
- Inclua pelo menos 1 dado ou estimativa de impacto (tempo perdido, risco jurídico, turnover)
- Mostre como a RemunaIA resolve isso de forma concreta
- CTA final: "Conheça a RemunaIA em remunaia.com"
- 5 a 7 hashtags relevantes no final
- Máximo 1.200 caracteres no total
- Não use emojis em excesso, apenas 1 ou 2 estratégicos
`,

  benchmark_salarios: `
Você é o copywriter da RemunaIA, uma plataforma de IA para decisões de remuneração no Brasil.
Crie um post para LinkedIn em português, tom consultivo e autoritativo.

Tema: A importância crítica de usar benchmarks de mercado nas decisões salariais.
Objetivo: Educar o RH sobre os riscos de remunerar sem dados e posicionar RemunaIA como a ferramenta que resolve isso.

Regras:
- Comece com um insight ou dado sobre equidade salarial ou retenção de talentos
- Use uma pergunta retórica para provocar reflexão
- Mostre como a RemunaIA usa benchmarks atualizados automaticamente
- CTA: "Teste grátis em remunaia.com"
- 5 a 7 hashtags relevantes
- Máximo 1.200 caracteres
`,

  ia_transformando_rh: `
Você é o copywriter da RemunaIA, uma plataforma de IA para decisões de remuneração no Brasil.
Crie um post para LinkedIn em português, tom inovador mas acessível.

Tema: Como a inteligência artificial está transformando decisões de remuneração no RH estratégico.
Objetivo: Mostrar que a IA não é ficção científica no RH — a RemunaIA já é realidade.

Regras:
- Contraste claro entre o jeito antigo (manual, lento, arriscado) e o jeito novo (IA, rápido, fundamentado)
- Cite pelo menos 1 benefício concreto: redução de tempo de análise, embasamento jurídico, dados de mercado
- Tom moderno mas sem jargões técnicos
- CTA: "Veja como funciona em remunaia.com"
- 5 a 7 hashtags relevantes
- Máximo 1.200 caracteres
`,

  funcionalidade_remunaia: `
Você é o copywriter da RemunaIA, uma plataforma de IA para decisões de remuneração no Brasil.
Crie um post para LinkedIn em português, tom demonstrativo e direto ao valor.

Tema: O simulador de decisões da RemunaIA — como ele analisa promoções, aumentos e desligamentos considerando impacto financeiro, benchmarks de mercado e aspectos jurídicos, tudo em minutos.

Regras:
- Comece descrevendo um cenário real: "Sua empresa precisa decidir sobre uma promoção..."
- Explique o que a RemunaIA entrega: relatório com fundamento, impacto no budget, risco jurídico, comparativo de mercado
- Finalize com o benefício: decisão mais rápida, justa e segura para a empresa
- CTA: "Simule grátis em remunaia.com"
- 5 a 7 hashtags
- Máximo 1.200 caracteres
`,

  dado_mercado: `
Você é o copywriter da RemunaIA, uma plataforma de IA para decisões de remuneração no Brasil.
Crie um post para LinkedIn em português, tom analítico e informativo.

Tema: Um dado ou tendência atual sobre remuneração, retenção de talentos ou gestão de pessoas no mercado brasileiro.
Objetivo: Gerar valor com informação relevante e conectar ao benefício de usar dados na hora de decidir.

Regras:
- Inicie com um dado impactante (pode ser uma estimativa contextualizada, não precisa ser citação exata)
- Faça uma análise breve do impacto para as empresas brasileiras
- Conecte naturalmente ao papel da RemunaIA em ajudar o RH a tomar decisões baseadas em dados
- CTA: "Saiba mais em remunaia.com"
- 5 a 7 hashtags
- Máximo 1.200 caracteres
`,

  pergunta_engajamento: `
Você é o copywriter da RemunaIA, uma plataforma de IA para decisões de remuneração no Brasil.
Crie um post para LinkedIn em português, tom conversacional e instigante.

Tema: Uma pergunta que provoque debate genuíno sobre remuneração, equidade salarial, ou o papel do RH em decisões estratégicas.
Objetivo: Gerar comentários e engajamento, posicionando a RemunaIA como referência no tema.

Regras:
- Dê um contexto breve e instigante (2-3 linhas)
- Faça UMA pergunta principal clara e aberta
- Convide explicitamente as pessoas a comentarem
- CTA sutil no final: "Aqui na RemunaIA ajudamos o RH a responder perguntas como essa com dados. remunaia.com"
- 5 a 7 hashtags
- Máximo 1.200 caracteres
`,
}

async function db(path: string, method = 'GET', body?: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=minimal' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok && method !== 'PATCH' && method !== 'POST') {
    throw new Error(`Supabase error: ${await res.text()}`)
  }
  if (method === 'GET') return res.json()
  return res
}

async function getValidToken(): Promise<string> {
  const [cfg] = await db('/linkedin_config?select=*&limit=1')
  if (!cfg) throw new Error('LinkedIn config ausente no Supabase. Configure o token primeiro.')

  const expiresAt = new Date(cfg.access_token_expires_at)
  const refreshThreshold = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  if (expiresAt > refreshThreshold) return cfg.access_token

  // Refresh token
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: cfg.refresh_token,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) throw new Error(`Refresh do token LinkedIn falhou: ${await res.text()}`)

  const { access_token, expires_in, refresh_token } = await res.json()
  await db(`/linkedin_config?id=eq.${cfg.id}`, 'PATCH', {
    access_token,
    refresh_token: refresh_token || cfg.refresh_token,
    access_token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  })

  return access_token
}

async function getNextTheme(): Promise<Theme> {
  const posts = await db('/linkedin_posts?select=theme_index&order=created_at.desc&limit=1')
  const lastIndex: number = posts[0]?.theme_index ?? -1
  return THEMES[(lastIndex + 1) % THEMES.length]
}

async function generateContent(theme: Theme): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPTS[theme] }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.9 },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini API error: ${await res.text()}`)
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

async function postToLinkedIn(token: string, content: string): Promise<string> {
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: process.env.LINKEDIN_ORG_URN!,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  })
  if (!res.ok) throw new Error(`LinkedIn API error: ${await res.text()}`)
  const data = await res.json()
  return data.id
}

export default async function handler(request: Request): Promise<Response> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const token = await getValidToken()
    const theme = await getNextTheme()
    const content = await generateContent(theme)
    const linkedinPostId = await postToLinkedIn(token, content)

    await db('/linkedin_posts', 'POST', {
      theme,
      theme_index: THEMES.indexOf(theme),
      content,
      linkedin_post_id: linkedinPostId,
    })

    return new Response(JSON.stringify({ success: true, theme, linkedinPostId }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron-linkedin]', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
