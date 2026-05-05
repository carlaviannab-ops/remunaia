// Recebe o código OAuth do LinkedIn e salva os tokens no Supabase.
export const config = { runtime: 'edge' }

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return new Response(`Erro do LinkedIn: ${error}`, { status: 400 })
  }

  if (state !== process.env.CRON_SECRET) {
    return new Response('State inválido', { status: 403 })
  }

  if (!code) {
    return new Response('Código ausente', { status: 400 })
  }

  // Troca o code pelo access_token
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.APP_URL}/api/linkedin-callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  })

  if (!tokenRes.ok) {
    return new Response(`Erro ao obter token: ${await tokenRes.text()}`, { status: 500 })
  }

  const { access_token, expires_in, refresh_token } = await tokenRes.json()
  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

  // Verifica se já existe uma config salva
  const existing = await fetch(`${SUPABASE_URL}/rest/v1/linkedin_config?select=id&limit=1`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  }).then(r => r.json())

  const payload = {
    access_token,
    refresh_token,
    access_token_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }

  if (existing[0]?.id) {
    await fetch(`${SUPABASE_URL}/rest/v1/linkedin_config?id=eq.${existing[0].id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } else {
    await fetch(`${SUPABASE_URL}/rest/v1/linkedin_config`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    })
  }

  return new Response(
    `<html><body style="font-family:sans-serif;padding:2rem">
      <h2>✅ LinkedIn conectado com sucesso!</h2>
      <p>Tokens salvos no Supabase. O agente vai publicar automaticamente a cada 3 dias.</p>
      <p>Token expira em: <strong>${new Date(expiresAt).toLocaleDateString('pt-BR')}</strong></p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
