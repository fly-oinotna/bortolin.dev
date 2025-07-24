export default {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://accounts.google.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640],
  },
  async redirects() {
    return [
      {
        source: '/servizi/realizzazione-siti-web-statici-e-dinamici-treviso-e-provincia',
        destination: '/servizi/realizzazione-siti-web-statici-e-dinamici',
        permanent: true,
      },
      {
        source: '/servizi/realizzazione-siti-web-statici-e-dinamici-venezia-e-provincia',
        destination: '/servizi/realizzazione-siti-web-statici-e-dinamici',
        permanent: true,
      },
      {
        source: '/servizi/realizzazione-siti-web-statici-e-dinamici-pordenone-e-provincia',
        destination: '/servizi/realizzazione-siti-web-statici-e-dinamici',
        permanent: true,
      },
      {
        source: '/servizi/realizzazione-siti-web-statici-e-dinamici-udine-e-provincia',
        destination: '/servizi/realizzazione-siti-web-statici-e-dinamici',
        permanent: true,
      },
      {
        source: '/servizi/realizzazione-siti-web-statici-e-dinamici-triveneto',
        destination: '/servizi/realizzazione-siti-web-statici-e-dinamici',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
