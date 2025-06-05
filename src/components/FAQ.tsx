'use client'

import { useState } from 'react'

import Minus from '@/components/icons/Minus'
import Plus from '@/components/icons/Plus'

type FAQItem = {
    question: string
    answer: string
}

type FAQAccordionProps = {
    faqs: FAQItem[]
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            {faqs.map((faq, index) => (
                <div key={index} className='block max-w-4xl mx-auto py-2 lg:py-4'>
                    <div className='shadow-lg rounded-2xl overflow-hidden'>
                        <button
                            onClick={() => toggleFAQ(index)}
                            className={`w-full flex justify-between items-center gap-6 lg:gap-12 text-left p-6 lg:p-8 ${openIndex === index ? 'bg-gray-100 rounded-b-none' : 'bg-gray-200 rounded-b-2xl'}`}
                        >
                            <h3 className='mb-0 text-lg font-semibold'>{faq.question}</h3>
                            {openIndex === index ?
                                <div className='rotate-180'>
                                    <Minus />
                                </div>
                                :
                                <div className='-rotate-180'>
                                    <Plus />
                                </div>
                            }
                        </button>
                        <div className={`transition-all duration-300 ease-in-out bg-gray-100 w-full ${openIndex === index ? 'max-h-screen overflow-visible opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
                            <div className='text-left pb-6 lg:pb-8 px-6 lg:px-8'>
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}