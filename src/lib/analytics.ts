import posthog from 'posthog-js'

const key = import.meta.env.VITE_POSTHOG_KEY
const keyValida = key && key.startsWith('phc_') && key.length > 20 && key !== 'phc_SUA_CHAVE_POSTHOG'

export const initAnalytics = () => {
  if (keyValida) posthog.init(key, { api_host: 'https://app.posthog.com' })
}

export const track = (evento: string, props?: Record<string, unknown>) => {
  if (keyValida) posthog.capture(evento, props)
}

export const identify = (userId: string, props?: Record<string, unknown>) => {
  if (keyValida) posthog.identify(userId, props)
}

export const eventos = {
  CADASTRO:            'user_signed_up',
  LOGIN:               'user_logged_in',
  SIMULACAO_INICIADA:  'simulation_started',
  SIMULACAO_CONCLUIDA: 'simulation_completed',
  PDF_EXPORTADO:       'pdf_exported',
  UPGRADE_CLICADO:     'upgrade_clicked',
  RESULTADO_VISTO:     'result_viewed',
  TRIAL_EXPIRADO:      'trial_expired',
}
