export const GTM_ID = 'GTM-M87QWFCB'

declare global {
  interface Window {
    gtag?: (command: 'consent', action: 'update', params: Record<string, string>) => void
  }
}

type ConsentState = 'granted' | 'denied'

export function updateConsent(consent: {
  ad_storage?: ConsentState
  analytics_storage?: ConsentState
  functionality_storage?: ConsentState
  personalization_storage?: ConsentState
  security_storage?: ConsentState
}) {
  if (typeof window === 'undefined') return

  window.gtag?.('consent', 'update', consent)
}
