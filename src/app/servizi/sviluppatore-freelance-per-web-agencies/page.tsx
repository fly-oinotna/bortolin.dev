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
    title: 'Sviluppo Web per Agenzie | WordPress, Plugin, Temi e Web App Personalizzati',
    description: 'Sviluppo siti WordPress, plugin, temi e applicazioni web su misura per web agency e freelance. Preventivi chiari, rispetto delle scadenze e codice performante.',
    keywords: [
        'sviluppo web agenzie',
        'sviluppo plugin WordPress',
        'temi WordPress personalizzati',
        'web app su misura',
        'freelance sviluppo WordPress',
        'collaborazione agenzie web',
        'sviluppatore WordPress',
        'realizzazione siti per agenzie',
        'white label WordPress',
        'soluzioni digitali personalizzate'
    ]
}


export default function FreelancerForAgencies() {

    const faqs = [
        {
            question: 'Collabori anche con web agency in white label?',
            answer: 'Sì, lavoro regolarmente in modalità white label per agenzie che desiderano commissionare lo sviluppo ad una risorsa esterna, senza compromettere la qualità. Mantengo la massima riservatezza e mi adatto al tuo flusso di lavoro.'
        },
        {
            question: 'Quali tecnologie utilizzi per lo sviluppo?',
            answer: 'Per realizzare siti web moderni, sicuri e performanti, utilizzo le seguenti tecnologie: WordPress, Next.js, Tailwind CSS e TypeScript. Ho una profonda conoscenza di Bootstrap, PHP e JavaScript. Posso inoltre realizzare siti web basati al 100% su WordPress o ibridi, come ad esempio WordPress come backend (headless) e Next.js come frontend. Ogni progetto è adattato alle esigenze specifiche del cliente o dell’agenzia.'
        },
        {
            question: 'Quanto è flessibile il processo di sviluppo?',
            answer: 'Estremamente flessibile. Posso partire da un tuo design o occuparmi anche della progettazione UX/UI. Adatto il mio flusso alle tue esigenze: briefing, versioni, revisioni, consegna finale.'
        },
        {
            question: 'Come vengono gestiti tempi e costi?',
            answer: 'Ogni progetto ha un preventivo chiaro e un calendario concordato. Nessuna sorpresa: rispetto delle scadenze e nessun costo aggiuntivo non approvato. Puoi contare su affidabilità e precisione.'
        },
        {
            question: 'Offri anche supporto post-consegna?',
            answer: 'Sì, su richiesta posso fornire assistenza continuativa, aggiornamenti, miglioramenti futuri o formazione. Il mio obiettivo è costruire collaborazioni durature con agenzie affidabili.'
        }
    ]


    return (
        <>
            <Header />

            <section className='py-10 md:py-16 lg:py-20'>
                <div className='container grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12'>
                    <div className='lg:col-span-3'>
                        <h1 className='text-black leading-4'><span className='text-sm font-normal'>Sviluppo web per agenzie e professionisti</span></h1>
                        <h2 className='text-black'><span className='lg:text-6xl'>Soluzioni su misura per agenzie web</span></h2>
                        <p className='my-6'>Collaboro con web agency e professionisti per realizzare siti web, applicazioni e funzionalità WordPress personalizzate. Offro un processo semplice e trasparente: prezzi chiari, tempi certi, codice di qualità.</p>
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
                        <h2 className='text-black'>Collaborazione su misura per web agency</h2>
                        <p>Realizzo progetti su misura per <strong>agenzie web e freelance</strong> che cercano un partner tecnico affidabile. Ogni progetto è sviluppato in modo personalizzato, seguendo le specifiche fornite dall’agenzia, con attenzione a SEO, performance e semplicità d’uso.</p>
                        <p className='m-0'>Temi, plugin, web app o siti completi: posso occuparmi dello sviluppo in autonomia o affiancare il team esistente. <strong>Tempi certi, comunicazione fluida e costi chiari da subito</strong>. Nessuna sorpresa, solo risultati concreti.</p>
                    </div>
                    <div>
                        <h2 className='text-black'>Un processo semplice, trasparente, affidabile</h2>
                        <p>Dalla raccolta delle specifiche alla consegna finale, <strong>ogni fase è chiara e gestita con precisione</strong>. I tempi e i costi sono definiti a preventivo e rispettati. Nessun ritardo, nessun costo extra imprevisto.</p>
                        <p className='m-0'>Siti e funzionalità sono progettati per essere <strong>intuitivi sia per l’utente finale che per chi li gestisce</strong>. Al termine, fornisco documentazione e – se richiesto – assistenza continuativa o formazione per il team dell’agenzia.</p>
                    </div>
                </div>
            </section>

            <section className='container py-10 md:py-16 lg:py-20'>
                <div className='bg-bd-green rounded-3xl p-4 md:p-6 lg:p-8 text-center'>
                    <h2 className='text-black'>Cerchi un freelance affidabile per i tuoi progetti WordPress?</h2>
                    <p>Sono il partner tecnico che molte <strong>web agency</strong> e freelance scelgono per sviluppare soluzioni personalizzate in modo professionale e senza stress.<br />Contattami per un confronto senza impegno.</p>
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
                            "@id": "https://bortolin.dev/servizi/sviluppatore-freelance-per-web-agencies",
                            "name": "Sviluppo Web per Agenzie",
                            "url": "https://bortolin.dev/servizi/sviluppatore-freelance-per-web-agencies",
                            "mainEntityOfPage": "https://bortolin.dev/servizi/sviluppatore-freelance-per-web-agencies",
                            "areaServed": "https://en.wikipedia.org/wiki/Europe",
                            "additionalType": "https://en.wikipedia.org/wiki/Web_design",
                            "logo": "https://bortolin.dev/images/logo-bortolin-sviluppatore-web-freelance.svg",
                            "image": "https://bortolin.dev/images/og-image.jpg",
                            "description": "Sviluppo siti WordPress, plugin, temi e applicazioni web su misura per web agency e freelance. Preventivi chiari, rispetto delle scadenze e codice performante.",
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
