import Head from 'next/head'

import Script from 'next/script'
import { GTM_ID } from '@/lib/gtm'

import type { Metadata } from 'next'
import "./globals.css"

import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/images/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/icons/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/images/icons/favicon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/images/icons/apple-touch-icon.png', sizes: '180x180' }
    ]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Head>
        <Script id="gtm-init" strategy="afterInteractive">
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
        <Script
          id="gtm"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
        />
        <Script
          id="gtm"
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-YH2Q50YGVK`}
        />
        <Script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-YH2Q50YGVK');
          `}
        </Script>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Antonio Bortolin - Sviluppatore Web",
              "url": "https://bortolin.dev",
              "logo": "https://bortolin.dev/path-to-your-logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+39-123-456-789",
                "contactType": "Customer Service",
                "areaServed": "IT",
                "availableLanguage": "Italian"
              },
              "sameAs": [
                "https://www.linkedin.com/in/antonio-bortolin",
                "https://twitter.com/antonio_bortolin",
                "https://github.com/antonio-bortolin"
              ]
            })
          }}
        />

        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://bortolin.dev",
              "name": "Antonio Bortolin - Sviluppatore Web",
              "description": "Sito web di Antonio Bortolin, sviluppatore web freelance che offre soluzioni personalizzate per siti web e applicazioni.",
              "potentialAction": [
                {
                  "@type": "ContactAction",
                  "name": "Compila il modulo di contatto",
                  "target": "https://bortolin.dev/contatti",
                  "description": "Compila il modulo di contatto per metterti in contatto con Antonio Bortolin per richieste o informazioni."
                },
                {
                  "@type": "ReserveAction",
                  "name": "Prenota una chiamata gratuita",
                  "target": "https://bortolin.dev/prenota",
                  "description": "Prenota una videochiamata gratuita di 15 minuti con Antonio Bortolin per discutere delle tue esigenze."
                }
              ]
            })
          }}
        />

        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://bortolin.dev"
                }
              ]
            })
          }}
        />
      </Head>
      <html lang="it" className='scroll-smooth'>
        <body className='text-gray-800'>
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
    </>

  );
}
