'use client'

import { usePathname } from 'next/navigation'

export default function BreadcrumbSchema() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    const itemListElement = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://bortolin.dev'
        },
        ...segments.map((segment, index) => {
            const name = decodeURIComponent(segment)
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())

            const item = `https://bortolin.dev/${segments.slice(0, index + 1).join('/')}`

            return {
                '@type': 'ListItem',
                position: index + 2,
                name,
                item
            }
        })
    ]

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}