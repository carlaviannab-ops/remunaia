// Rota de uso único para iniciar o fluxo OAuth do LinkedIn.
// Acesse: https://remunaia.com/api/linkedin-auth
export const config = { runtime: 'edge' }

export default function handler(): Response {
  const clientId = process.env.LINKEDIN_CLIENT_ID!
  const redirectUri = `${process.env.APP_URL}/api/linkedin-callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'w_organization_social r_organization_social',
    state: process.env.CRON_SECRET!,
  })

  return Response.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params}`,
    302
  )
}
