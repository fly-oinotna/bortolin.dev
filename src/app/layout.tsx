import Script from 'next/script'
import { GTM_ID } from '@/lib/gtm'

import type { Metadata } from 'next'
import './globals.css'
import { plusJakartaSans } from '../lib/fonts'

import CookieBanner from '@/components/CookieBanner'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/images/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/icons/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/images/icons/favicon-512.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [
      { url: '/images/icons/apple-touch-icon.png', sizes: '180x180' }
    ]
  },
  openGraph: {
    images: [
      {
        url: 'https://bortolin.dev/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Antonio Bortolin - Sviluppatore Web'
      }
    ]
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className={plusJakartaSans.variable + ' scroll-smooth'}>
      <head>
        <Script id="gtm-consent" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'denied',
              personalization_storage: 'denied',
              security_storage: 'granted'
            });
          `}
        </Script>

        <Script id="gtm-loader" strategy="lazyOnload">
          {`
            setTimeout(() => {
              const s = document.createElement('script');
              s.src = "https://www.googletagmanager.com/gtm.js?id=${GTM_ID}";
              s.async = true;
              document.head.appendChild(s);
            }, 3000);
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Antonio Bortolin - Sviluppatore Web",
              "url": "https://bortolin.dev",
              "logo": "https://bortolin.dev/images/logo-bortolin-sviluppatore-web-freelance.svg",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+39 371 596 2874",
                "contactType": "Customer Service",
                "areaServed": "IT",
                "availableLanguage": "Italian"
              },
              "sameAs": [
                "https://www.facebook.com/bortolin.dev",
                "https://www.linkedin.com/in/antonio-bortolin"
              ]
            })
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://bortolin.dev",
              "name": "Antonio Bortolin - Sviluppatore Web",
              "description":
                "Sito web di Antonio Bortolin, sviluppatore web freelance che offre soluzioni personalizzate per siti web e applicazioni.",
              "potentialAction": [
                {
                  "@type": "ContactAction",
                  "name": "Compila il modulo di contatto",
                  "target": "https://bortolin.dev/contatti",
                  "description":
                    "Compila il modulo di contatto per metterti in contatto con Antonio Bortolin per richieste o informazioni."
                },
                {
                  "@type": "ReserveAction",
                  "name": "Prenota una chiamata gratuita",
                  "target": "https://bortolin.dev/prenota",
                  "description":
                    "Prenota una videochiamata gratuita di 15 minuti con Antonio Bortolin per discutere delle tue esigenze."
                }
              ]
            })
          }}
        />

        <BreadcrumbSchema />
      </head>
      <body className="text-gray-800">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
