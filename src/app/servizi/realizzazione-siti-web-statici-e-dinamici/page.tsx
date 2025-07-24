import type { Metadata } from 'next'

import Link from 'next/link'
import Image from 'next/image'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

import FAQ from '@/components/FAQ'
import ToolTip from '@/components/ToolTip'

import Accessibility from '@/components/icons/Accessibility'
import ArrowRight from '@/components/icons/ArrowRight'
import Analysis from '@/components/icons/Analysis'
import Code from '@/components/icons/Code'
import Design from '@/components/icons/Design'
import Rocket from '@/components/icons/Rocket'
import Speed from '@/components/icons/Speed'
import SEO from '@/components/icons/SEO'
import Support from '@/components/icons/Support'

export const metadata: Metadata = {
    title: 'Design e sviluppo di siti web | 💻 Sviluppo Siti Web & Project Management 🚀',
    description: 'Un sito web di qualità è essenziale per il successo della tua azienda. Scopri come posso aiutarti a creare una presenza online efficace, professionale e competitiva.',
}

export default function WebDesignServices() {

    const faqs = [
        {
            question: 'Quali vantaggi offre un sito web su misura rispetto a un modello predefinito?',
            answer: 'Un sito web su misura offre numerosi vantaggi rispetto ai modelli predefiniti. La principale differenza sta nella personalizzazione totale: un sito creato su misura è progettato appositamente per rispondere alle specifiche esigenze del tuo business, allineandosi perfettamente ai tuoi obiettivi e alla tua brand identity. Ciò include la creazione di un design esclusivo e una struttura ottimizzata per la user experience, elementi che spesso mancano nei template generici. Inoltre, le funzionalità del sito vengono sviluppate su misura per garantire che ogni aspetto del progetto risponda in modo efficace alle necessità aziendali. Al contrario, i modelli predefiniti, sebbene economici, offrono solo opzioni limitate di personalizzazione e possono non essere sufficientemente scalabili o ottimizzati per una performance di alto livello.'
        },
        {
            question: 'Quanto tempo serve per realizzare un sito?',
            answer: 'Il tempo di sviluppo di un sito web dipende dalla complessità del progetto e dalle funzionalità richieste. In genere, la creazione di un sito web su misura richiede un periodo di 3-6 settimane, a seconda della quantità di contenuti, delle personalizzazioni e delle fasi di testing.'
        },
        {
            question: 'Posso aggiornare il sito autonomamente?',
            answer: 'Assolutamente sì. I siti web che sviluppo sono basati su piattaforme CMS (Content Management System) facili da usare, come WordPress, che ti permettono di aggiornare e gestire i contenuti in modo autonomo. Che si tratti di aggiungere nuove pagine, modificare testi o caricare immagini, avrai il pieno controllo sul tuo sito senza necessitare di competenze tecniche avanzate.'
        },
        {
            question: 'Offri anche la manutenzione del sito?',
            answer: 'Sì, oltre alla realizzazione del sito, offro un servizio di manutenzione continua per garantire che il tuo sito sia sempre aggiornato e performante. La manutenzione può includere l\'aggiornamento regolare di plugin, temi e il miglioramento della sicurezza, oltre alla risoluzione di eventuali problemi tecnici. Inoltre, sono disponibile a implementare nuove funzionalità, ottimizzare le performance e adattare il sito alle nuove tendenze del web design e alle esigenze del mercato. Con questo servizio, puoi concentrarti sul tuo business, mentre io mi occupo della parte tecnica, mantenendo il tuo sito sempre al top.'
        },
        {
            question: 'Il sito sarà ottimizzato per i motori di ricerca (Google, Bing, ecc.)?',
            answer: 'Sì, la SEO (Search Engine Optimization) è una parte fondamentale del mio processo di sviluppo. Ogni sito che creo viene ottimizzato per i motori di ricerca seguendo le migliori pratiche SEO, per migliorare la visibilità online e aumentare il traffico organico. Il mio obiettivo è assicurarmi che il tuo sito non solo appaia tra i risultati di ricerca, ma che si posizioni in modo competitivo, aumentando le possibilità di essere trovato dai tuoi potenziali clienti.'
        }
    ]

    return (
        <>
            <Header />

            <section className='py-10 md:py-16 lg:py-20'>
                <div className='container grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12'>
                    <div className='lg:col-span-3'>
                        <h1 className='text-black leading-4'><span className='text-sm font-normal'>Design e sviluppo di siti web per piccole e medie imprese, privati e web agencies</span></h1>
                        <h2 className='text-black'><span className='lg:text-6xl'>La tua azienda merita una presenza online di qualità</span></h2>
                        <p className='my-6'>Puoi offrire i migliori servizi o prodotti sul mercato, ma senza una presenza web di qualità rischi di restare invisibile. Un sito ben progettato non è solo una vetrina, ma uno strumento strategico per trasmettere credibilità, attrarre clienti e distinguerti dalla concorrenza.<br />Aiuta la tua azienda a comunicare il suo valore in modo efficace.</p>
                        <div className='flex items-center gap-4'>
                            <Link className='btn-secondary' href={'#lavoriamo-assieme'} title='Lavoriamo assieme'>Lavoriamo assieme <ArrowRight /></Link>
                            <Link href={'#faq'} title='FAQs'>Domande frequenti</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className='pb-10 md:pb-16 lg:pb-20'>
                <div className='container'>
                    <h2>I vantaggi di un sito ben progettato</h2>
                    <ul className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-6'>
                        <li className='border-8 border-black bg-black text-white rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Speed width={80} height={80} className='fill-bd-green mx-auto' />
                            <h3 className='text-lg mt-3'>Prestazioni di alto livello</h3>
                            <p className='text-sm mb-0'>Un sito veloce riduce i tempi di caricamento, migliora l’esperienza utente e favorisce il posizionamento su Google, aumentando conversioni e traffico.</p>
                        </li>
                        <li className='border-8 border-bd-green rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Design width={80} height={80} className='mx-auto' />
                            <h3 className='text-lg mt-3'>Design accattivante</h3>
                            <p className='text-sm mb-0'>Un’interfaccia curata e intuitiva trasmette professionalità, facilita la navigazione e rende il sito più efficace nel coinvolgere i visitatori.</p>
                        </li>
                        <li className='border-8 border-bd-green bg-bd-green rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Accessibility width={80} height={80} className='fill-black mx-auto' />
                            <h3 className='text-lg mt-3'><ToolTip text={'L\'accessibilità web rende i siti utilizzabili da tutti, incluse persone con disabilità. Ottimizzando codice, design e contenuti, si migliora l’esperienza utente e si garantisce un accesso equo alle informazioni, indipendentemente dalle capacità o dai dispositivi usati.'}>Accessibilità</ToolTip> garantita</h3>
                            <p className='text-sm mb-0'>Un sito accessibile è fruibile da tutti, migliora l’usabilità e rispetta gli standard web, aumentando il pubblico e l’inclusività online.</p>
                        </li>
                        <li className='border-8 border-gray-100 bg-gray-100 rounded-3xl flex flex-col items-center p-6 text-center'>
                            <SEO width={80} height={80} className='fill-black mx-auto' />
                            <h3 className='text-lg mt-3'>Ottimizzazione <ToolTip text={'La SEO (Search Engine Optimization) ottimizza un sito per apparire tra i primi risultati su Google; migliorando contenuti, struttura, velocità e link esterni si può aumentare la visibilità senza pagare per la pubblicità.'}>SEO</ToolTip></h3>
                            <p className='text-sm mb-0'>Un sito ottimizzato per la SEO migliora il ranking su Google, aumentando visibilità e traffico organico senza costi pubblicitari.</p>
                        </li>
                    </ul>
                </div>
            </section>

            <section className='bg-gray-100 py-10 md:py-16 lg:py-20'>
                <div className='container grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12'>
                    <div>
                        <div className='sticky top-28'>
                            <h2 className='text-black'>Il mio metodo di lavoro</h2>
                            <p>Un processo ben strutturato è essenziale per ottenere risultati eccellenti. Lavoro con un metodo chiaro e definito, che riduce gli imprevisti, migliora l’efficienza e garantisce il massimo della qualità. Dall’analisi iniziale alla manutenzione post-lancio, ogni fase è progettata per soddisfare al meglio le esigenze dei clienti, ottimizzando tempi e risorse.</p>
                            <Link className='btn-primary mt-3' href={'#lavoriamo-assieme'}>Lavoriamo assieme <ArrowRight /></Link>
                        </div>
                    </div>
                    <div className='relative'>
                        <div className='bg-white rounded-2xl p-4 lg:p-6 shadow-lg mb-4 lg:mb-6'>
                            <div className='flex items-center mb-4 gap-4'>
                                <div className='bg-bd-green rounded-full p-2 inline-block'>
                                    <Analysis width={40} height={40} className='stroke-black' />
                                </div>
                                <h3 className='m-0'>1 - Analisi</h3>
                            </div>
                            <p className='mb-0'>Studio le esigenze del cliente, il mercato di riferimento e gli obiettivi da raggiungere. Questa fase permette di creare una strategia chiara e mirata.</p>
                        </div>
                        <div className='bg-white rounded-2xl p-4 lg:p-6 shadow-lg mb-4 lg:mb-6'>
                            <div className='flex items-center mb-2 gap-2'>
                                <div className='bg-bd-green rounded-full p-2 inline-block'>
                                    <Design width={40} height={40} className='fill-black' />
                                </div>
                                <h3 className='m-0'>2 - Design</h3>
                            </div>
                            <p className='mb-0'>Progetto un’interfaccia intuitiva e accattivante, che valorizzi l’identità del brand e migliori l’esperienza utente, garantendo navigabilità ed efficacia.</p>
                        </div>
                        <div className='bg-white rounded-2xl p-4 lg:p-6 shadow-lg mb-4 lg:mb-6'>
                            <div className='flex items-center mb-2 gap-2'>
                                <div className='bg-bd-green rounded-full p-2 inline-block'>
                                    <Code width={40} height={40} className='stroke-black' />
                                </div>
                                <h3 className='m-0'>3 - Sviluppo</h3>
                            </div>
                            <p className='mb-0'>Trasformo il design in un sito performante, accessibile e ottimizzato, utilizzando tecnologie moderne per garantire velocità, sicurezza e affidabilità.</p>
                        </div>
                        <div className='bg-white rounded-2xl p-4 lg:p-6 shadow-lg mb-4 lg:mb-6'>
                            <div className='flex items-center mb-2 gap-2'>
                                <div className='bg-bd-green rounded-full p-2 inline-block'>
                                    <Rocket width={40} height={40} className='stroke-black' />
                                </div>
                                <h3 className='m-0'>4 - Test e lancio</h3>
                            </div>
                            <p className='mb-0'>Eseguo test approfonditi su dispositivi e browser diversi, correggendo eventuali errori prima del rilascio, per garantire agli utenti un’esperienza fluida e priva di intoppi.</p>
                        </div>
                        <div className='bg-white rounded-2xl p-4 lg:p-6 shadow-lg'>
                            <div className='flex items-center mb-2 gap-2'>
                                <div className='bg-bd-green rounded-full p-2 inline-block'>
                                    <Support width={40} height={40} className='fill-black' />
                                </div>
                                <h3 className='m-0'>5 - Assistenza</h3>
                            </div>
                            <p className='mb-0'>Dopo il lancio, offro supporto tecnico e aggiornamenti, assicurando che il sito rimanga sicuro, performante e allineato alle esigenze del cliente nel tempo.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className='pt-10 md:pt-16 lg:pt-20'>
                <div className='container grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 xl:gap-24'>
                    <div>
                        <h2 className='text-black'>Meno pensieri, più risultati</h2>
                        <p>Non devi preoccuparti di trovare immagini, scrivere testi o realizzare video: <strong>posso occuparmene io</strong>. Collaboro con professionisti per fornirti contenuti su misura, così puoi concentrarti sul tuo business senza perdite di tempo.</p>
                        <p className='m-0'>Ogni elemento del sito viene curato nei minimi dettagli, con contenuti di qualità che valorizzano il tuo progetto ed aiutano a posizionarlo al meglio nei motori di ricerca. Così posso fornirti un <strong>servizio completo e senza stress</strong> e garantirti il miglior risultato.</p>
                    </div>
                    <div>
                        <h2 className='text-black'>Un servizio chiaro e senza sorprese</h2>
                        <p>Dal primo contatto fino al lancio del sito, <strong>tutto è trasparente</strong>. Definisco da subito tempi e costi, così <strong>sai sempre cosa aspettarti</strong>. Ogni dettaglio del progetto viene concordato in anticipo, evitando sorprese lungo il percorso.</p>
                        <p className='m-0'>L'importo stabilito a preventivo è fisso e copre tutte le funzionalità definite insieme. Se durante lo sviluppo emergono complessità aggiuntive, mi occupo di risolverle senza costi extra per te. Il mio obiettivo è offrirti un <strong>servizio chiaro e professionale</strong>, garantendo il massimo risultato senza imprevisti economici.</p>
                    </div>
                </div>
            </section>

            <section className='pt-10 md:pt-16 lg:pt-20'>
                <div className='container'>
                    <h2 className='text-black mb-8'>Le tecnologie che utilizzo</h2>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12'>
                        <div className='bg-gray-100 rounded-2xl p-4 lg:p-6 shadow-lg'>
                            <div className='flex items-center gap-4 mb-4'>
                                <Image src={'/images/icons/html-5.svg'} width={50} height={50} alt='HTML 5 vector logo' />
                                <Image src={'/images/icons/css-3.svg'} width={50} height={50} alt='CSS 3 vector logo' />
                            </div>
                            <h3 className='text-black'>HTML / CSS</h3>
                            <p className='m-0'>HTML e CSS sono il cuore di ogni sito web. HTML è la struttura di base del sito, mentre CSS si occupa dello stile, rendendo le pagine belle e facili da navigare.</p>
                        </div>
                        <div className='bg-gray-100 rounded-2xl p-4 lg:p-6 shadow-lg'>
                            <div className='flex items-center gap-4 mb-4'>
                                <Image src={'/images/icons/react.svg'} width={50} height={50} alt='React vector logo' />
                                <Image src={'/images/icons/next-js.svg'} width={50} height={50} alt='Next.js vector logo' />
                            </div>
                            <h3 className='text-black'>React / Next.js</h3>
                            <p className='m-0'>Con React e Next.js posso creare siti dalle prestazioni elevatissime: i tempi di caricamento delle pagine sono talmente ridotti da sembrare praticamente istantanei.</p>
                        </div>
                        <div className='bg-gray-100 rounded-2xl p-4 lg:p-6 shadow-lg'>
                            <div className='flex items-center gap-4 mb-4'>
                                <Image src={'/images/icons/wordpress.svg'} width={50} height={50} alt='WordPress vector logo' />
                            </div>
                            <h3 className='text-black'>WordPress</h3>
                            <p className='m-0'>WordPress è il CMS più diffuso al mondo. È flessibile e permette di gestire un sito in modo semplice e senza complicazioni, ideale per blog, siti aziendali ed e-commerce.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className='container py-10 md:py-16 lg:py-20'>
                <div className='bg-bd-green rounded-3xl p-4 md:p-6 lg:p-8 text-center'>
                    <h2 className='text-black'>Dai valore alla tua presenza online</h2>
                    <p>Un sito web professionale è un investimento strategico per il tuo business. <br />Migliora la tua immagine, attrai nuovi clienti e fai crescere la tua attività.</p>
                    <Link className='btn-secondary mt-2' href={'#lavoriamo-assieme'} title='Lavoriamo assieme'>Parliamone <ArrowRight /></Link>
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
                            "@id": "https://bortolin.dev/servizi/realizzazione-siti-web-statici-e-dinamici",
                            "name": "Design e sviluppo di siti web",
                            "url": "https://bortolin.dev/servizi/realizzazione-siti-web-statici-e-dinamici",
                            "mainEntityOfPage": "https://bortolin.dev/servizi/realizzazione-siti-web-statici-e-dinamici",
                            "areaServed": "https://en.wikipedia.org/wiki/Europe",
                            "additionalType": "https://en.wikipedia.org/wiki/Web_design",
                            "logo": "https://bortolin.dev/images/logo-bortolin-sviluppatore-web-freelance.svg",
                            "image": "https://bortolin.dev/images/og-image.jpg",
                            "description": "Un sito web di qualità è essenziale per il successo della tua azienda. Scopri come posso aiutarti a creare una presenza online efficace, professionale e competitiva.",
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
