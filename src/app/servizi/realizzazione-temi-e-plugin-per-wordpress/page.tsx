import type { Metadata } from 'next'

import Link from 'next/link'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

import FAQ from '@/components/FAQ'

import Accessibility from '@/components/icons/Accessibility'
import ArrowRight from '@/components/icons/ArrowRight'
import Design from '@/components/icons/Design'
import Speed from '@/components/icons/Speed'
import SEO from '@/components/icons/SEO'

export const metadata: Metadata = {
  title: 'Sviluppo di Plugin e Temi WordPress | Soluzioni Personalizzate 🚀',
  description: 'Realizzo plugin e temi WordPress su misura per le esigenze del tuo progetto. Scopri come posso aiutarti a creare soluzioni altamente personalizzate, performanti e sicure.',
  keywords: [
    'sviluppo plugin WordPress',
    'temi WordPress personalizzati',
    'WordPress su misura',
    'freelance WordPress',
    'sviluppatore WordPress',
    'realizzazione plugin WordPress',
    'soluzioni WordPress personalizzate',
    'temi custom WordPress',
    'web agency WordPress',
    'plugin professionali WordPress'
  ]
}


export default function WordPressDevelopment() {

    const faqs = [
        {
            question: 'Perché scegliere un tema WordPress personalizzato?',
            answer: 'Un tema WordPress su misura offre massima flessibilità, prestazioni elevate e un design unico perfettamente allineato alla tua brand identity. Eviti i limiti e le inefficienze dei temi preconfezionati, ottenendo una soluzione ottimizzata per le tue esigenze specifiche.'
        },
        {
            question: 'Quanto tempo serve per sviluppare un tema o un plugin personalizzato?',
            answer: 'I tempi di sviluppo dipendono dalla complessità del progetto. Un tema personalizzato richiede mediamente dalle 2 alle 4 settimane, mentre un plugin varia in base alle funzionalità richieste.'
        },
        {
            question: 'Posso gestire il mio sito autonomamente dopo lo sviluppo?',
            answer: 'Assolutamente sì. I miei temi e plugin sono progettati per essere intuitivi e facilmente gestibili, anche senza competenze tecniche avanzate. Fornisco documentazione chiara e, se necessario, formazione personalizzata.'
        },
        {
            question: 'Offri assistenza e aggiornamenti?',
            answer: 'Sì, fornisco assistenza continua, aggiornamenti di sicurezza e miglioramenti per garantire che il tuo sito resti performante e compatibile con le ultime versioni di WordPress.'
        },
        {
            question: 'I tuoi temi e plugin sono ottimizzati per la SEO?',
            answer: 'Certamente. Ogni sviluppo tiene conto delle best practice SEO per garantire codice pulito, tempi di caricamento rapidi e una struttura che aiuti il posizionamento su Google.'
        }
    ]

    return (
        <>
            <Header />

            <section className='py-10 md:py-16 lg:py-20'>
                <div className='container grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12'>
                    <div className='lg:col-span-3'>
                        <h1 className='text-black leading-4'><span className='text-sm font-normal'>Sviluppo di temi e plugin personalizzati per WordPress</span></h1>
                        <h2 className='text-black'><span className='lg:text-6xl'>Soluzioni su misura per il tuo progetto</span></h2>
                        <p className='my-6'>Un sito WordPress veramente efficace deve essere costruito su misura. Temi e plugin personalizzati garantiscono flessibilità, performance e una gestione ottimale del tuo progetto online.</p>
                        <div className='flex items-center gap-4'>
                            <Link className='btn-secondary' href={'#lavoriamo-assieme'} title='Contattami'>Contattami <ArrowRight /></Link>
                            <Link href={'#faq'} title='FAQs'>Domande frequenti</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className='pb-10 md:pb-16 lg:pb-20'>
                <div className='container'>
                    <h2>Vantaggi di un tema o plugin personalizzato</h2>
                    <ul className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-6'>
                        <li className='border-8 border-black bg-black text-white rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Speed width={80} height={80} className='fill-bd-green mx-auto' />
                            <h3 className='text-lg mt-3'>Performance elevate</h3>
                            <p className='text-sm mb-0'>Temi e plugin ottimizzati garantiscono velocità di caricamento e un'esperienza utente superiore.</p>
                        </li>
                        <li className='border-8 border-bd-green rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Design width={80} height={80} className='mx-auto' />
                            <h3 className='text-lg mt-3'>Design unico</h3>
                            <p className='text-sm mb-0'>Ogni progetto è personalizzato per adattarsi perfettamente alla tua identità visiva.</p>
                        </li>
                        <li className='border-8 border-bd-green bg-bd-green rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Accessibility width={80} height={80} className='fill-black mx-auto' />
                            <h3 className='text-lg mt-3'>Accessibilità</h3>
                            <p className='text-sm mb-0'>Codice pulito e best practice per garantire usabilità e compatibilità.</p>
                        </li>
                        <li className='border-8 border-gray-100 bg-gray-100 rounded-3xl flex flex-col items-center p-6 text-center'>
                            <SEO width={80} height={80} className='fill-black mx-auto' />
                            <h3 className='text-lg mt-3'>SEO Ready</h3>
                            <p className='text-sm mb-0'>Struttura e codice ottimizzati per ottenere il massimo della visibilità online.</p>
                        </li>
                    </ul>
                </div>
            </section>

            <section>
                <div className='container grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 xl:gap-24'>
                    <div>
                        <h2 className='text-black'>Funzionalità su misura, senza limiti</h2>
                        <p>Con plugin e temi sviluppati da zero, il tuo sito WordPress può fare molto più di quanto immagini. <strong>Non ci sono limiti</strong>: posso creare funzionalità completamente personalizzate, perfettamente integrate con il design e le esigenze del tuo progetto.</p>
                        <p className='m-0'>Sistemi di prenotazione per ristoranti o professionisti, aree riservate per clienti, integrazioni con gestionali, moduli avanzati, filtri dinamici, cataloghi personalizzati... <strong>tutto si può fare</strong>. Ogni elemento è progettato per essere intuitivo da usare e ottimizzato per offrire prestazioni elevate e massima flessibilità.</p>
                    </div>
                    <div>
                        <h2 className='text-black'>Funzionalità WordPress su misura</h2>
                        <p>Sviluppo <strong>temi e plugin personalizzati</strong> per WordPress, realizzati interamente da me per adattarsi perfettamente alle esigenze del tuo progetto. Ogni funzionalità è pensata per essere <strong>semplice da usare per l’utente</strong> e facile da gestire per te o il tuo team.</p>
                        <p className='m-0'>Il codice è scritto su misura, <strong>senza componenti inutili</strong>, per garantire <strong>massime prestazioni</strong> e una base solida ottimizzata per i motori di ricerca. Ogni dettaglio è studiato per migliorare la visibilità online e offrire un'esperienza fluida sia per chi visita il sito che per chi lo gestisce.</p>
                    </div>
                </div>
            </section>

            <section className='container py-10 md:py-16 lg:py-20'>
                <div className='bg-bd-green rounded-3xl p-4 md:p-6 lg:p-8 text-center'>
                    <h2 className='text-black'>Porta il tuo sito WordPress al livello successivo</h2>
                    <p>Un tema o un plugin personalizzato fa la differenza.<br />Affidati ad un esperto per ottenere la massima qualità e flessibilità.</p>
                    <Link className='btn-secondary mt-2' href={'#lavoriamo-assieme'} title='Contattami'>Parliamone <ArrowRight /></Link>
                </div>
            </section>

            <section className='bg-gray-100 py-10 md:py-16 lg:py-20 mb-10 md:mb-16 lg:mb-20' id='faq'>
                <div className='container'>
                    <h2 className='lg:text-4xl text-black mb-8'>Domande Frequenti</h2>
                    <FAQ faqs={faqs} />
                </div>
            </section>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        {
                            "@context": "https://schema.org",
                            "@type": "Service",
                            "@id": "https://bortolin.dev/servizi/realizzazione-temi-e-plugin-per-wordpress",
                            "name": "Sviluppo di Plugin e Temi WordPress",
                            "url": "https://bortolin.dev/servizi/realizzazione-temi-e-plugin-per-wordpress",
                            "mainEntityOfPage": "https://bortolin.dev/servizi/realizzazione-temi-e-plugin-per-wordpress",
                            "areaServed": "https://en.wikipedia.org/wiki/Europe",
                            "additionalType": "https://en.wikipedia.org/wiki/WordPress#Themes",
                            "logo": "https://bortolin.dev/images/logo-bortolin-sviluppatore-web-freelance.svg",
                            "image": "https://bortolin.dev/images/og-image.jpg",
                            "description": "Realizzo plugin e temi WordPress su misura per le esigenze del tuo progetto. Scopri come posso aiutarti a creare soluzioni altamente personalizzate, performanti e sicure.",
                            "provider": [{
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
                                    "https://www.linkedin.com/in/antonio-bortolin",
                                ]
                            }]
                        }
                    )
                }}
            />

            <Footer />
        </>
    )
}
