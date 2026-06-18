import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type TipoMovimento = "promocao" | "aumento" | "contratacao" | "ajuste_faixa" | "contraproposta"

interface BodySimulacao {
  tipo: TipoMovimento
  cargo_atual: string
  cargo_proposto?: string
  salario_atual: number
  salario_proposto: number
  regime: "clt" | "pj"
  setor: string
  estado: string
  contexto_adicional?: string
  budget_informado?: boolean
  budget_valor?: number
  pares_existem?: boolean
  salario_medio_pares?: number
  historico_avaliacao?: string
  politica_salarial?: string
  nivel_senioridade?: string
  tempo_cargo?: string
  ultimo_reajuste?: string
  percentual_ultimo_reajuste?: number
  criticidade_cargo?: string
  beneficio_vr?: number
  beneficio_saude?: number
  beneficio_vt?: number
  beneficio_odonto?: number
  beneficio_outros?: number
  _lote_id?: string
}

const limitesPorPlano: Record<string, number> = {
  trial: 3,
  starter: 20,
  professional: Infinity,
  enterprise: Infinity,
}

function verificarLimite(profile: { plano: string; simulacoes_usadas_mes: number; trial_expira_em: string }): boolean {
  if (profile.plano === "trial" && new Date(profile.trial_expira_em) < new Date()) return false
  const limite = limitesPorPlano[profile.plano] ?? 0
  return profile.simulacoes_usadas_mes < limite
}

const SYSTEM_PROMPT = `Voce e um consultor senior especializado em remuneracao estrategica com 15 anos de experiencia em empresas brasileiras de medio e grande porte. Sua especialidade e analise de estruturas salariais, benchmarks de mercado e tomada de decisao organizacional.

MISSAO: Analisar o caso de remuneracao apresentado e entregar uma recomendacao clara, objetiva e aplicavel.

REGRAS CRITICAS (nao negociaveis):
1. NUNCA responda de forma generica. Cada analise deve ser especifica ao caso.
2. SEMPRE entregue uma recomendacao clara.
3. SEMPRE inclua impacto financeiro com numeros reais (R$).
4. SEMPRE posicione o salario em relacao ao mercado (P25/P50/P75).
5. Se faltar informacao, crie cenarios plausiveis e declare explicitamente.
6. Use benchmarks de: Robert Half Guia Salarial 2026, Portal Salario.com.br, CAGED/MTE.
7. Considere o fator de conversao CLT->PJ de 1,30 a 1,40x.
8. Ajuste benchmarks por setor: Educacao (-15% a -25%), Tecnologia (+15% a +25%), Saude (mercado), Varejo (-10% a -15%), Servicos (mercado).
9. Para regime CLT: em cada linha da simulacao_financeira.tabela, calcule custo_total_empregador_anual = (salario_mensal x 12 x 1.70) + beneficios_anuais. O beneficios_anuais sera informado no prompt (soma anual dos beneficios mensais: VR, saude, VT, odonto, outros). Se nenhum beneficio for informado, beneficios_anuais = 0. O multiplicador 1.70 cobre: FGTS 8%, INSS patronal ~20%, 13o salario, ferias+1/3, provisoes. Este numero e o custo REAL e TOTAL para a empresa, fundamental para CFO/CHRO. Para PJ: custo_total_empregador_anual = salario_mensal x 12 + beneficios_anuais (sem o multiplicador CLT, pois nao ha encargos patronais).
10. O campo 'condicoes' da recomendacao DEVE ser especifico ao caso: mencione numeros concretos (salario dos pares, gap percentual exato vs. P50, prazos especificos, valores em R$). PROIBIDO texto generico como 'deve ser acompanhada de plano de desenvolvimento' sem numeros concretos que fundamentem a condicao.
11. O array 'riscos' DEVE conter SEMPRE no minimo 3 riscos distintos e especificos ao caso. PROIBIDO retornar apenas 1 ou 2 riscos.
12. O campo benchmark_mercado.confiabilidade DEVE refletir a certeza dos dados: use 'alta' para cargos/setores bem documentados (TI, Financeiro, RH em SP/RJ), 'media' para setores ou estados com dados parciais, 'baixa' para estimativas com pouca base publica. NUNCA invente salarios de pessoas ou empresas reais.
13. O campo aviso_metodologia (raiz do JSON) DEVE conter uma frase curta e direta alertando que os valores sao estimativas baseadas em benchmarks publicos e devem ser validados com pesquisas especificas da empresa antes de qualquer decisao.

FORMATO DE SAIDA: Retorne APENAS um JSON valido, sem markdown, sem texto fora do JSON, seguindo exatamente o schema especificado.`

const JSON_SCHEMA = `{
  "resumo_cenario": "string",
  "simulacao_financeira": {
    "tabela": [
      {"cenario": "string", "salario_mensal": number, "variacao_percentual": number, "custo_anual_incremental": number, "custo_total_empregador_anual": number}
    ],
    "nota": "string"
  },
  "benchmark_mercado": {
    "fonte": "string",
    "p25": number,
    "p50": number,
    "p75": number,
    "p90": number,
    "posicionamento_atual": "string",
    "posicionamento_proposto": "string",
    "ajuste_setor": "string",
    "confiabilidade": "alta | media | baixa",
    "nota": "string"
  },
  "equidade_interna": {
    "analise": "string",
    "risco_distorcao": "baixo | medio | alto",
    "recomendacao_equidade": "string"
  },
  "riscos": [
    {"risco": "string", "nivel": "baixo | medio | alto", "descricao": "string", "mitigacao": "string"}
  ],
  "recomendacao": {
    "decisao": "string",
    "salario_recomendado": number,
    "justificativa": "string",
    "condicoes": "string",
    "urgencia": "imediata | pode aguardar | nao recomendado agora"
  },
  "conclusao_estrategica": "string",
  "suposicoes_adotadas": ["string"],
  "comunicacao_colaborador": {
    "tom": "string",
    "texto": "string",
    "pontos_chave": ["string"]
  },
  "aviso_metodologia": "string"
}`

function montarPrompt(body: BodySimulacao): string {
  const regime = body.regime.toUpperCase()
  const budget = body.budget_informado && body.budget_valor
    ? `R$ ${body.budget_valor} (informado: Sim)`
    : "nao informado"
  const pares = body.pares_existem ? "Sim" : "Nao"
  const salarioPares = body.pares_existem && body.salario_medio_pares
    ? `R$ ${body.salario_medio_pares}`
    : "nao informado"
  const avaliacao = body.historico_avaliacao || "nao informado"
  const politica = body.politica_salarial || "nao informado"
  const contexto = body.contexto_adicional || "nao informado"
  const senioridade = body.nivel_senioridade || "nao informado"
  const tempoCargo = body.tempo_cargo || "nao informado"
  const ultimoReajuste = body.ultimo_reajuste || "nao informado"
  const percentualUltimoReajuste = body.percentual_ultimo_reajuste
    ? `${body.percentual_ultimo_reajuste}%`
    : "nao informado"
  const criticidade = body.criticidade_cargo || "nao informado"

  const totalBeneficios = (body.beneficio_vr ?? 0) + (body.beneficio_saude ?? 0) + (body.beneficio_vt ?? 0) + (body.beneficio_odonto ?? 0) + (body.beneficio_outros ?? 0)
  const beneficiosStr = totalBeneficios > 0
    ? `VR: R$ ${body.beneficio_vr ?? 0} | Saude: R$ ${body.beneficio_saude ?? 0} | VT: R$ ${body.beneficio_vt ?? 0} | Odonto: R$ ${body.beneficio_odonto ?? 0} | Outros: R$ ${body.beneficio_outros ?? 0} — TOTAL MENSAL: R$ ${totalBeneficios} — TOTAL ANUAL: R$ ${totalBeneficios * 12}`
    : "nao informado"

  switch (body.tipo) {
    case "promocao":
      return `TIPO DE MOVIMENTO: Promocao\n\nDADOS DO CASO:\n- Cargo atual: ${body.cargo_atual}\n- Cargo proposto: ${body.cargo_proposto || body.cargo_atual}\n- Salario atual: R$ ${body.salario_atual} (${regime})\n- Salario proposto: R$ ${body.salario_proposto} (${regime})\n- Variacao proposta: ${(((body.salario_proposto - body.salario_atual) / body.salario_atual) * 100).toFixed(1)}%\n- Beneficios mensais (custo empresa): ${beneficiosStr}\n- Budget disponivel: ${budget}\n- Setor: ${body.setor}\n- Estado: ${body.estado}\n- Historico de avaliacao: ${avaliacao}\n- Politica salarial da empresa: ${politica}\n- Criticidade do cargo proposto: ${criticidade}\n- Contexto adicional: ${contexto}\n- Ha outros colaboradores no mesmo cargo: ${pares} | Salario medio dos pares: ${salarioPares}\n\nINSTRUCAO ESPECIAL — PROMOCAO COM CENARIOS OBRIGATORIOS:\n1. Na simulacao_financeira, inclua EXATAMENTE 3 cenarios:\n   a) \"Manter cargo atual (sem promocao)\" — salario_mensal = ${body.salario_atual}, variacao_percentual = 0, custo_anual_incremental = 0. Mencione o risco de retencao e desmotivacao.\n   b) \"Promocao proposta — R$ ${body.salario_proposto}\" — o valor informado. custo_anual_incremental = diferenca anual vs. salario atual.\n   c) \"Promocao ao P50 do cargo proposto\" — valor exato da mediana de mercado para o novo cargo/setor/estado. Se o salario proposto ja e o P50, use o P75 neste cenario com label \"Promocao competitiva (P75)\".\n2. Calcule o gap entre o salario proposto e o P50 do cargo proposto e mencione no resumo_cenario.\n3. Em recomendacao.condicoes: mencione numeros concretos (gap vs. P50 do cargo proposto em R$ e %, salario dos pares se informado, criterios de entrega com prazos especificos). PROIBIDO texto generico sem valores concretos.\n\nAnalise este caso de promocao seguindo as regras e retorne o JSON com o schema abaixo:\n${JSON_SCHEMA}`

    case "aumento":
      return `TIPO DE MOVIMENTO: Aumento Salarial (mesmo cargo)\n\nDADOS DO CASO:\n- Cargo: ${body.cargo_atual}\n- Salario atual: R$ ${body.salario_atual} (${regime})\n- Salario proposto: R$ ${body.salario_proposto} (${regime})\n- Variacao proposta: ${(((body.salario_proposto - body.salario_atual) / body.salario_atual) * 100).toFixed(1)}%\n- Beneficios mensais (custo empresa): ${beneficiosStr}\n- Budget disponivel: ${budget}\n- Setor: ${body.setor}\n- Estado: ${body.estado}\n- Nivel de senioridade: ${senioridade}\n- Tempo no cargo: ${tempoCargo}\n- Ultimo reajuste: ${ultimoReajuste}\n- Percentual do ultimo reajuste: ${percentualUltimoReajuste}\n- Historico de avaliacao: ${avaliacao}\n- Criticidade do cargo: ${criticidade}\n- Contexto adicional: ${contexto}\n- Pares internos: ${pares} | Salario medio dos pares: ${salarioPares}\n\nINSTRUCAO ESPECIAL — ANALISE DE DEFASAGEM DE MERCADO:\nApos calcular o benchmark:\n1. Se salario_atual < P50: calcule o gap de defasagem e mencione no resumo_cenario (ex: \"colaborador esta X% abaixo da mediana de mercado\").\n2. Se a variacao proposta nao eleva o salario ao menos 50% em direcao ao P50: em recomendacao.condicoes, indique que o aumento nao resolve a defasagem e informe o valor minimo para atingir o P50.\n3. Na simulacao_financeira, inclua SEMPRE estes 3 cenarios:\n   a) \"Nao aprovar aumento\" — manter salario atual com riscos de retencao\n   b) \"Ajuste ao P50\" — valor exato da mediana de mercado para este cargo/setor/estado\n   c) \"Aumento proposto (R$ ${body.salario_proposto})\" — o valor solicitado\n4. Na recomendacao, seja explicito se o aumento proposto e suficiente, insuficiente ou excessivo em relacao ao mercado.\n5. Em recomendacao.condicoes: seja ESPECIFICO ao caso. Se ha dados de pares (${salarioPares}), mencione o gap em R$ e %. Se ha defasagem vs. P50, mencione o valor exato. Se ha historico de avaliacao (${avaliacao}), vincule a condicao ao desempenho com criterio mensuravel. PROIBIDO texto generico sem numeros concretos.\n\nAnalise este caso de aumento salarial seguindo as regras e retorne o JSON com o schema abaixo:\n${JSON_SCHEMA}`

    case "contratacao":
      return `TIPO DE MOVIMENTO: Nova Contratacao\n\nDADOS DO CASO:\n- Cargo a contratar: ${body.cargo_proposto || body.cargo_atual}\n- Salario a oferecer: R$ ${body.salario_proposto} (${regime})\n- Beneficios mensais a oferecer (custo empresa): ${beneficiosStr}\n- Budget disponivel: ${budget}\n- Setor: ${body.setor}\n- Estado: ${body.estado}\n- Nivel de senioridade: ${senioridade}\n- Politica salarial da empresa: ${politica}\n- Criticidade do cargo: ${criticidade}\n- Contexto adicional: ${contexto}\n- Pares internos no mesmo cargo: ${pares} | Salario medio dos pares: ${salarioPares}\n\nINSTRUCAO ESPECIAL — NOVA CONTRATACAO:\nNa simulacao_financeira, inclua EXATAMENTE 3 cenarios:\n  a) \"Oferta abaixo do mercado (P25)\" — valor do P25 para o cargo/setor/estado\n  b) \"Oferta proposta (R$ ${body.salario_proposto})\" — o valor informado, com posicionamento vs. P50\n  c) \"Oferta competitiva (P75)\" — valor para atrair candidatos mais experientes\nNo campo salario_mensal do cenario \"a\", use o valor do P25. Para o custo_anual_incremental: use o delta anual vs. o valor do P25.\nEm recomendacao.condicoes: mencione numeros concretos (gap vs. P50, salario dos pares se informado, valor maximo justificado de budget, criterios de avaliacao no periodo de experiencia com prazo). PROIBIDO texto generico sem valores em R$ ou %.\n\nAnalise esta decisao de contratacao seguindo as regras e retorne o JSON com o schema abaixo:\n${JSON_SCHEMA}`

    case "ajuste_faixa":
      return `TIPO DE MOVIMENTO: Ajuste de Faixa Salarial\n\nDADOS DO CASO:\n- Cargo: ${body.cargo_atual}\n- Salario atual: R$ ${body.salario_atual} (${regime})\n- Posicionamento solicitado: R$ ${body.salario_proposto} (${regime})\n- Variacao solicitada: ${(((body.salario_proposto - body.salario_atual) / body.salario_atual) * 100).toFixed(1)}%\n- Beneficios mensais (custo empresa): ${beneficiosStr}\n- Setor: ${body.setor}\n- Estado: ${body.estado}\n- Nivel de senioridade: ${senioridade}\n- Ultimo reajuste: ${ultimoReajuste}\n- Percentual do ultimo reajuste: ${percentualUltimoReajuste}\n- Criticidade do cargo: ${criticidade}\n- Pares internos: ${pares} | Salario medio dos pares: ${salarioPares}\n- Contexto adicional: ${contexto}\n\nINSTRUCAO ESPECIAL — AJUSTE DE FAIXA COM CENARIOS OBRIGATORIOS:\n1. Na simulacao_financeira, inclua EXATAMENTE 3 cenarios:\n   a) \"Ajuste ao P50\" — valor exato da mediana de mercado\n   b) \"Ajuste ao P75\" — valor exato do terceiro quartil\n   c) \"Posicionamento solicitado (R$ ${body.salario_proposto})\" — o valor pedido\n2. Se o valor solicitado > P75: na recomendacao, indique o valor recomendado como o P75 e explique o que justificaria aprovacao ate P90 (ex: escassez do perfil, risco de perda iminente).\n3. PROIBIDO recomendar somente \"aguardar\" sem valor alternativo. Se recomendar aguardar, DEVE especificar o valor de ajuste parcial imediato (minimo ao P50, se o salario atual estiver abaixo).\n4. Se salario_atual < P25: urgencia = \"imediata\". Mencione no resumo_cenario o risco de retencao elevado.\n5. Em equidade_interna, compare o salario atual e o proposto com o salario medio dos pares e identifique se o ajuste cria ou resolve distorcoes.\n6. Em recomendacao.condicoes: mencione numeros concretos (gap exato em R$ e % vs. P50, salario dos pares se informado, prazo maximo para o ajuste nao impactar retencao). PROIBIDO texto generico sem valores concretos.\n\nAnalise este ajuste de faixa seguindo as regras e retorne o JSON com o schema abaixo:\n${JSON_SCHEMA}`

    case "contraproposta": {
      const gapAbsoluto = body.salario_proposto - body.salario_atual
      const gapPercent = (((body.salario_proposto - body.salario_atual) / body.salario_atual) * 100).toFixed(1)
      const parcial = Math.round(body.salario_atual + gapAbsoluto * 0.6)
      return `TIPO DE MOVIMENTO: Contraproposta (colaborador recebeu oferta da concorrencia)\n\nDADOS DO CASO:\n- Cargo do colaborador: ${body.cargo_atual}\n- Salario atual: R$ ${body.salario_atual} (${regime})\n- Oferta da concorrencia: R$ ${body.salario_proposto} (${regime})\n- Gap da oferta vs. salario atual: R$ ${gapAbsoluto} (${gapPercent}% acima)\n- Beneficios mensais atuais (custo empresa): ${beneficiosStr}\n- Budget disponivel para contraproposta: ${budget}\n- Setor: ${body.setor}\n- Estado: ${body.estado}\n- Nivel de senioridade: ${senioridade}\n- Tempo no cargo: ${tempoCargo}\n- Historico de avaliacao: ${avaliacao}\n- Criticidade do cargo: ${criticidade}\n- Pares internos: ${pares} | Salario medio dos pares: ${salarioPares}\n- Contexto adicional: ${contexto}\n\nINSTRUCAO ESPECIAL — CONTRAPROPOSTA COM CUSTO REAL DE REPOSICAO:\nEsta e situacao de ALTA URGENCIA. Use as instrucoes abaixo rigorosamente:\n\n1. Na simulacao_financeira, inclua EXATAMENTE estes 3 cenarios:\n\n   a) \"Nao fazer contraproposta (custo de reposicao)\"\n      - salario_mensal = 0\n      - variacao_percentual = 0\n      - custo_anual_incremental = CUSTO TOTAL DE REPOSICAO calculado assim:\n        * Recrutamento e selecao: 1 a 2 meses do salario atual (fee de headhunter ou tempo interno)\n        * Onboarding e curva de aprendizado: 3 a 5 meses com produtividade reduzida (~30% do salario)\n        * Perda de produtividade durante a vaga aberta: 1 a 2 meses de salario\n        * Total estimado = 5 a 9 x salario mensal atual\n        * Para criticidade ALTA: multiplique por 1,5 (perfil escasso = busca mais longa e cara)\n        * NUNCA coloque 0 neste campo. O valor MINIMO e 5 x R$ ${body.salario_atual} = R$ ${body.salario_atual * 5}\n      - No campo 'cenario': descreva o custo como \"Custo de reposicao estimado: R$ [valor calculado]\"\n\n   b) \"Contraproposta parcial (match ~60% do gap) — R$ ${parcial}\"\n      - salario_mensal = R$ ${parcial} (salario atual + 60% do gap de R$ ${gapAbsoluto})\n      - custo_anual_incremental = delta anual vs. salario atual\n\n   c) \"Match total da oferta — R$ ${body.salario_proposto}\"\n      - salario_mensal = R$ ${body.salario_proposto}\n      - custo_anual_incremental = delta anual vs. salario atual\n\n2. Para criticidade ALTA: riscos devem incluir obrigatoriamente risco estrategico de perda de conhecimento critico.\n   Para criticidade BAIXA: mencionar que reposicao e mais viavel e o custo de reposicao e menor.\n\n3. Em recomendacao.condicoes: seja ESPECIFICO. Mencione: valor exato da contraproposta recomendada, prazo para resposta, condicoes vinculantes (ex: plano de carreira, cargo especifico em X meses), comparacao com salario dos pares se informado. NAO use frases genericas sem numeros.\n\nAnalise este caso de contraproposta seguindo as regras e retorne o JSON com o schema abaixo:\n${JSON_SCHEMA}`
    }
  }
}

function normalizarNivel(nivel: string): "baixo" | "medio" | "alto" {
  const n = nivel.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  if (n === "baixo" || n === "low" || n === "minor") return "baixo"
  if (n === "alto" || n === "high" || n === "critical" || n === "critico") return "alto"
  return "medio"
}

function stripTrailingCommas(s: string): string {
  return s.replace(/,(\s*[}\]])/g, "$1")
}

function extrairJSON(text: string, fonte: string): unknown {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim()
  try { return JSON.parse(cleaned) } catch (_e1) { /* continua */ }
  try { return JSON.parse(stripTrailingCommas(cleaned)) } catch (_e2) { /* continua */ }
  const match = cleaned.match(/\{[\s\S]+\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch (_e3) { /* continua */ }
    try { return JSON.parse(stripTrailingCommas(match[0])) } catch (_e4) { /* continua */ }
  }
  throw new Error(`JSON invalido do modelo (${fonte})`)
}

// Modelos de IA — cascata com fallback automático
// IMPORTANTE: OpenRouter usa tier pago (sem :free) para evitar rate limit global
const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"]
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
const CEREBRAS_MODELS = ["llama-3.3-70b", "llama3.1-8b"]
const OPENROUTER_MODELS = [
  "meta-llama/llama-3.1-8b-instruct",
  "mistralai/mistral-7b-instruct",
  "google/gemma-2-9b-it",
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-chat-v3-0324",
]

async function fetchComTimeout(url: string, options: RequestInit, timeoutMs = 20000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function chamarOpenAICompat(
  url: string,
  headers: Record<string, string>,
  model: string,
  userPrompt: string,
): Promise<{ ok: boolean; text?: string; status?: number; err?: string }> {
  const res = await fetchComTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 8192,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    return { ok: false, status: res.status, err: err.substring(0, 200) }
  }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content as string | undefined
  return { ok: true, text }
}

async function chamarOpenAICompatSimples(
  url: string,
  headers: Record<string, string>,
  model: string,
  prompt: string,
): Promise<{ ok: boolean; text?: string; status?: number; err?: string }> {
  const res = await fetchComTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 512,
    }),
  }, 15000)
  if (!res.ok) {
    const err = await res.text()
    return { ok: false, status: res.status, err: err.substring(0, 200) }
  }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content as string | undefined
  return { ok: true, text }
}

async function chamarIA(userPrompt: string): Promise<unknown> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY")
  const groqKey = Deno.env.get("GROQ_API_KEY")
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY")
  const cerebrasKey = Deno.env.get("CEREBRAS_API_KEY")

  if (!openrouterKey && !groqKey && !cerebrasKey && !geminiKey) throw new Error("Nenhuma API key de IA configurada")

  // 1º — OpenRouter pago (sem :free): confiável enquanto houver crédito
  if (openrouterKey) {
    for (const model of OPENROUTER_MODELS) {
      try {
        const result = await chamarOpenAICompat(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            "Authorization": `Bearer ${openrouterKey}`,
            "HTTP-Referer": "https://remunaia.com.br",
            "X-Title": "RemunaIA",
          },
          model,
          userPrompt,
        )
        if (!result.ok) { console.error(`OpenRouter ${model} ${result.status}:`, result.err); continue }
        if (!result.text) { console.error(`OpenRouter ${model} resposta vazia`); continue }
        return extrairJSON(result.text, model)
      } catch (e) { console.error(`OpenRouter ${model} exception:`, (e as Error).message); continue }
    }
  }

  // 2º — Groq (gratuito, limite diário de tokens)
  if (groqKey) {
    for (const model of GROQ_MODELS) {
      try {
        const result = await chamarOpenAICompat(
          "https://api.groq.com/openai/v1/chat/completions",
          { "Authorization": `Bearer ${groqKey}` },
          model,
          userPrompt,
        )
        if (!result.ok) { console.error(`Groq ${model} ${result.status}:`, result.err); continue }
        if (!result.text) { console.error(`Groq ${model} resposta vazia`); continue }
        return extrairJSON(result.text, model)
      } catch (e) { console.error(`Groq ${model} exception:`, (e as Error).message); continue }
    }
  }

  // 3º — Cerebras (gratuito, limites generosos)
  if (cerebrasKey) {
    for (const model of CEREBRAS_MODELS) {
      try {
        const result = await chamarOpenAICompat(
          "https://api.cerebras.ai/v1/chat/completions",
          { "Authorization": `Bearer ${cerebrasKey}` },
          model,
          userPrompt,
        )
        if (!result.ok) { console.error(`Cerebras ${model} ${result.status}:`, result.err); continue }
        if (!result.text) { console.error(`Cerebras ${model} resposta vazia`); continue }
        return extrairJSON(result.text, model)
      } catch (e) { console.error(`Cerebras ${model} exception:`, (e as Error).message); continue }
    }
  }

  // 4º — Gemini (fallback final)
  if (geminiKey) {
    const payload = {
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192, responseMimeType: "application/json" },
    }
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`
        const res = await fetchComTimeout(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        if (!res.ok) {
          console.error(`Gemini ${model} ${res.status}:`, (await res.text()).substring(0, 200))
          continue
        }
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
        if (!text) { console.error(`Gemini ${model} resposta vazia`); continue }
        return extrairJSON(text, model)
      } catch (e) { console.error(`Gemini ${model} exception:`, (e as Error).message); continue }
    }
  }

  throw new Error("Todos os modelos de IA falharam")
}

async function chamarIASimples(prompt: string): Promise<unknown> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY")
  const groqKey = Deno.env.get("GROQ_API_KEY")
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY")
  const cerebrasKey = Deno.env.get("CEREBRAS_API_KEY")

  // 1º — OpenRouter pago
  if (openrouterKey) {
    for (const model of OPENROUTER_MODELS) {
      try {
        const result = await chamarOpenAICompatSimples(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            "Authorization": `Bearer ${openrouterKey}`,
            "HTTP-Referer": "https://remunaia.com.br",
            "X-Title": "RemunaIA",
          },
          model,
          prompt,
        )
        if (!result.ok || !result.text) { continue }
        return extrairJSON(result.text, model)
      } catch (e) { console.error(`OpenRouter simples ${model} exception:`, (e as Error).message); continue }
    }
  }

  // 2º — Groq
  if (groqKey) {
    for (const model of GROQ_MODELS) {
      try {
        const result = await chamarOpenAICompatSimples(
          "https://api.groq.com/openai/v1/chat/completions",
          { "Authorization": `Bearer ${groqKey}` },
          model,
          prompt,
        )
        if (!result.ok || !result.text) { continue }
        return extrairJSON(result.text, model)
      } catch (e) { console.error(`Groq simples ${model} exception:`, (e as Error).message); continue }
    }
  }

  // 3º — Cerebras
  if (cerebrasKey) {
    for (const model of CEREBRAS_MODELS) {
      try {
        const result = await chamarOpenAICompatSimples(
          "https://api.cerebras.ai/v1/chat/completions",
          { "Authorization": `Bearer ${cerebrasKey}` },
          model,
          prompt,
        )
        if (!result.ok || !result.text) { continue }
        return extrairJSON(result.text, model)
      } catch (e) { console.error(`Cerebras simples ${model} exception:`, (e as Error).message); continue }
    }
  }

  // 4º — Gemini (fallback final)
  if (geminiKey) {
    for (const model of GEMINI_MODELS) {
      try {
        const payload = {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512, responseMimeType: "application/json" },
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`
        const res = await fetchComTimeout(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, 15000)
        if (!res.ok) { console.error(`Gemini simples ${model} ${res.status}`); continue }
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
        if (!text) { continue }
        return extrairJSON(text, model)
      } catch (e) { console.error(`Gemini simples ${model} exception:`, (e as Error).message); continue }
    }
  }

  throw new Error("Todos os modelos de IA falharam")
}

function toNum(v: unknown): number {
  if (typeof v === "number") return isNaN(v) ? 0 : v
  if (typeof v === "string") return parseFloat(v.replace(/[^\d.,]/g, "").replace(",", ".")) || 0
  return 0
}

// ─── NORMALIZAÇÃO CANÔNICA ───────────────────────────────────────────────────
// Esta função é a única fonte de verdade sobre o schema do resultado.
// Qualquer alias que a IA retornar (campo renomeado, estrutura diferente) deve
// ser tratado AQUI — jamais nos componentes do frontend.
// Schema canônico: v60 (prompt_version = "v60")
// ─────────────────────────────────────────────────────────────────────────────
function normalizarEValidar(resultado: Record<string, unknown>): void {

  // ── 1. ALIASES DE NOMES DE CAMPO (IA às vezes ignora o schema exato) ────────

  // conclusao → conclusao_estrategica
  if (!resultado.conclusao_estrategica && resultado.conclusao) {
    resultado.conclusao_estrategica = resultado.conclusao
    delete resultado.conclusao
  }

  // script_comunicacao (schema antigo) → comunicacao_colaborador
  if (!resultado.comunicacao_colaborador && resultado.script_comunicacao) {
    const sc = resultado.script_comunicacao as Record<string, unknown>
    resultado.comunicacao_colaborador = {
      tom: "profissional",
      texto: sc.aprovacao || sc.aprovacao_parcial || sc.negativa || "",
      pontos_chave: [],
    }
    delete resultado.script_comunicacao
  }

  // tabela_financeira flat (schema antigo) → simulacao_financeira.tabela
  if (!resultado.simulacao_financeira && Array.isArray(resultado.tabela_financeira)) {
    resultado.simulacao_financeira = {
      tabela: (resultado.tabela_financeira as Record<string, unknown>[]).map((item) => ({
        cenario: item.componente || "Cenário",
        salario_mensal: toNum(item.valor_proposto),
        variacao_percentual: toNum(item.variacao_percentual),
        custo_anual_incremental: 0,
        custo_total_empregador_anual: toNum(item.custo_total_empresa),
      })),
    }
    delete resultado.tabela_financeira
  }

  // salario_sugerido → salario_recomendado
  const rec = resultado.recomendacao as Record<string, unknown> | undefined
  if (rec) {
    if (rec.salario_sugerido !== undefined && rec.salario_recomendado === undefined) {
      rec.salario_recomendado = rec.salario_sugerido
      delete rec.salario_sugerido
    }
    if (typeof rec.salario_recomendado !== "number") rec.salario_recomendado = toNum(rec.salario_recomendado)
    // proximos_passos (schema antigo) → condicoes string
    if (!rec.condicoes && Array.isArray(rec.proximos_passos)) {
      rec.condicoes = (rec.proximos_passos as string[]).join(" | ")
      delete rec.proximos_passos
    }
  }

  // equidade_interna: schema antigo tinha status/posicao_relativa/minimo_grupo
  const eq = resultado.equidade_interna as Record<string, unknown> | undefined
  if (eq) {
    if (!eq.risco_distorcao && eq.status) {
      eq.risco_distorcao = eq.status === "critico" ? "alto" : eq.status === "atencao" ? "medio" : "baixo"
    }
    if (!eq.analise) {
      eq.analise = eq.posicao_relativa as string || eq.observacao as string || ""
    }
    if (!eq.recomendacao_equidade) {
      eq.recomendacao_equidade = eq.observacao as string || ""
    }
    if (typeof eq.risco_distorcao === "string") eq.risco_distorcao = normalizarNivel(eq.risco_distorcao)
  }

  // ── 2. RISCOS: garantir campo 'risco' como título ────────────────────────────
  const riscos = resultado.riscos as Array<Record<string, unknown>> | undefined
  if (Array.isArray(riscos)) {
    for (const risco of riscos) {
      // Se a IA retornou o título no campo 'descricao' sem campo 'risco'
      if (!risco.risco && risco.descricao) {
        risco.risco = risco.descricao
        risco.descricao = ""
      }
      if (typeof risco.nivel === "string") risco.nivel = normalizarNivel(risco.nivel)
      else risco.nivel = "medio"
    }
  } else {
    resultado.riscos = []
  }

  // ── 3. BENCHMARK: tipos numéricos e confiabilidade ───────────────────────────
  const bm = resultado.benchmark_mercado as Record<string, unknown> | undefined
  if (bm) {
    for (const k of ["p25", "p50", "p75", "p90"]) {
      if (typeof bm[k] !== "number") bm[k] = toNum(bm[k])
    }
    const confRaw = (bm.confiabilidade as string | undefined)?.toLowerCase().trim()
    bm.confiabilidade = confRaw === "alta" || confRaw === "baixa" ? confRaw : "media"
  }

  // ── 4. AVISO DE METODOLOGIA: garantir sempre presente ───────────────────────
  if (!resultado.aviso_metodologia) {
    resultado.aviso_metodologia = "Os valores apresentados são estimativas baseadas em benchmarks públicos (Robert Half, Salario.com.br, CAGED/MTE) e devem ser validados com pesquisas específicas da empresa antes de qualquer decisão."
  }

  // ── 5. ESTRUTURAS ANINHADAS: garantir arrays e objetos ──────────────────────
  const com = resultado.comunicacao_colaborador as Record<string, unknown> | undefined
  if (com && !Array.isArray(com.pontos_chave)) com.pontos_chave = []

  const simFin = resultado.simulacao_financeira as Record<string, unknown> | undefined
  if (simFin && !Array.isArray(simFin.tabela)) simFin.tabela = []

  // ── 5b. TABELA: garantir ≥3 cenários usando benchmark como fallback ──────────
  if (simFin && Array.isArray(simFin.tabela) && (simFin.tabela as unknown[]).length < 3) {
    const tabela = simFin.tabela as Array<Record<string, unknown>>
    const bm = resultado.benchmark_mercado as Record<string, unknown> | undefined
    const existingMensais = new Set(tabela.map((r) => r.salario_mensal))
    const synthCandidates = [
      bm?.p25 != null ? { cenario: "Salário P25 (abaixo do mercado)", salario_mensal: toNum(bm.p25), variacao_percentual: 0, custo_anual_incremental: 0, custo_total_empregador_anual: 0 } : null,
      bm?.p50 != null ? { cenario: "Salário P50 (mediana de mercado)", salario_mensal: toNum(bm.p50), variacao_percentual: 0, custo_anual_incremental: 0, custo_total_empregador_anual: 0 } : null,
      bm?.p75 != null ? { cenario: "Salário P75 (acima do mercado)", salario_mensal: toNum(bm.p75), variacao_percentual: 0, custo_anual_incremental: 0, custo_total_empregador_anual: 0 } : null,
    ]
    for (const synth of synthCandidates) {
      if (tabela.length >= 3 || !synth) break
      if (!existingMensais.has(synth.salario_mensal)) {
        tabela.push(synth)
        existingMensais.add(synth.salario_mensal)
      }
    }
  }

  // ── 6. VALIDAÇÃO MÍNIMA ──────────────────────────────────────────────────────
  if (!resultado.resumo_cenario && !resultado.recomendacao) {
    throw new Error("Resposta da IA sem conteudo utilizavel")
  }
}

function recalcularCustoEmpregador(
  resultado: Record<string, unknown>,
  regime: string,
  totalBeneficiosMensal: number,
): void {
  const simFin = resultado.simulacao_financeira as Record<string, unknown> | undefined
  if (!simFin) return
  const tabela = simFin.tabela as Array<Record<string, unknown>> | undefined
  if (!Array.isArray(tabela)) return

  const beneficiosAnuais = totalBeneficiosMensal * 12
  const multiplicador = regime === "clt" ? 1.70 : 1.0

  for (const row of tabela) {
    const salario = typeof row.salario_mensal === "number" ? row.salario_mensal : 0
    if (salario > 0) {
      row.custo_total_empregador_anual = Math.round(salario * 12 * multiplicador + beneficiosAnuais)
    } else {
      row.custo_total_empregador_anual = Math.round(beneficiosAnuais)
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "nao autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

    const jwt = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "token invalido" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const rawBody = await req.json()

    // MODO BENCHMARK — retorna apenas dados de mercado sem salvar simulacao
    if ((rawBody as { _benchmark_only?: boolean })._benchmark_only) {
      const { cargo, nivel_senioridade, setor, estado, regime } = rawBody as {
        cargo: string; nivel_senioridade?: string; setor: string; estado: string; regime?: string
      }
      const prompt = `Voce e um especialista em remuneracao no Brasil com 15 anos de experiencia.\nForneca benchmarks salariais de mercado para o cargo abaixo. Retorne APENAS o JSON especificado.\n\nCargo: ${cargo}\nNivel de senioridade: ${nivel_senioridade || "nao informado"}\nSetor: ${setor}\nEstado: ${estado}\nRegime: ${(regime || "clt").toUpperCase()}\n\nUse como referencia: Robert Half Guia Salarial 2026, Portal Salario.com.br, CAGED/MTE.\nPara PJ: aplique fator 1,30x a 1,40x sobre o equivalente CLT.\nAjuste por setor: Educacao (-15% a -25%), Tecnologia (+15% a +25%), Saude (mercado), Varejo (-10% a -15%), Servicos (mercado).\n\nRetorne EXATAMENTE este JSON sem markdown, sem texto adicional:\n{"p25": number, "p50": number, "p75": number, "p90": number, "nota": "string"}`

      try {
        const resultado = await chamarIASimples(prompt) as Record<string, unknown>
        return new Response(JSON.stringify(resultado), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } })
      } catch (err) {
        return new Response(JSON.stringify({ error: "benchmark_error", message: (err as Error).message }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } })
      }
    }

    // MODO SIMULACAO NORMAL
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plano, simulacoes_usadas_mes, trial_expira_em")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "perfil nao encontrado" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    if (!verificarLimite(profile)) {
      return new Response(JSON.stringify({ error: "limite_atingido" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const body: BodySimulacao = rawBody
    const salarioAtualObrigatorio = body.tipo !== "contratacao"
    if (!body.tipo || !body.cargo_atual || (salarioAtualObrigatorio && !body.salario_atual) || !body.salario_proposto) {
      return new Response(JSON.stringify({ error: "dados obrigatorios ausentes" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const { data: simulacao, error: insertError } = await supabase
      .from("simulacoes")
      .insert({
        user_id: user.id,
        tipo: body.tipo,
        cargo_atual: body.cargo_atual,
        cargo_proposto: body.cargo_proposto,
        salario_atual: body.salario_atual ?? 0,
        salario_proposto: body.salario_proposto,
        regime: body.regime,
        setor: body.setor,
        estado: body.estado,
        status: "processando",
        prompt_version: "v60",
        lote_id: body._lote_id || null,
      })
      .select()
      .single()

    if (insertError || !simulacao) throw new Error("Erro ao criar simulacao no banco")

    const totalBeneficiosMensal = (body.beneficio_vr ?? 0) + (body.beneficio_saude ?? 0) + (body.beneficio_vt ?? 0) + (body.beneficio_odonto ?? 0) + (body.beneficio_outros ?? 0)
    const userPrompt = montarPrompt(body)
    let resultado: Record<string, unknown>

    try {
      resultado = (await chamarIA(userPrompt)) as Record<string, unknown>
      normalizarEValidar(resultado)
      recalcularCustoEmpregador(resultado, body.regime, totalBeneficiosMensal)
    } catch (iaError) {
      const errMsg = (iaError as Error).message
      console.error("Erro IA:", errMsg)
      await supabase.from("simulacoes").update({ status: "erro", erro_mensagem: errMsg, resultado: { _debug: errMsg } }).eq("id", simulacao.id)
      return new Response(JSON.stringify({ error: "ia_error", message: errMsg }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    await supabase.from("simulacoes").update({ resultado, status: "concluido", concluido_em: new Date().toISOString() }).eq("id", simulacao.id)
    await supabase.from("profiles").update({ simulacoes_usadas_mes: profile.simulacoes_usadas_mes + 1 }).eq("id", user.id)

    return new Response(JSON.stringify({ simulacao_id: simulacao.id, resultado }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (err) {
    console.error("Erro inesperado:", err)
    return new Response(JSON.stringify({ error: "erro_interno", message: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})
