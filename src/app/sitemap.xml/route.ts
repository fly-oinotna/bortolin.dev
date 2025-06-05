import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl = 'https://bortolin.dev'

  const staticPages = [
    '',
    '/servizi',
    '/servizi/realizzazione-siti-web-statici-e-dinamici',
    '/servizi/realizzazione-temi-e-plugin-per-wordpress',
    '/servizi/sviluppatore-freelance-per-web-agencies',
    '/servizi/project-manager-freelance-per-web-agencies',
    '/informativa-sulla-gestione-dei-cookie',
    '/informativa-sulla-privacy',
  ]

  const pagesXml = staticPages.map((page) => {
    return `
      <url>
        <loc>${siteUrl}${page}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
    `
  }).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pagesXml}
    </urlset>
  `

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
