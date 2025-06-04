import type { Metadata } from 'next'

import Link from 'next/link'
import Image from 'next/image'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ToolTip from '@/components/ToolTip'

import ArrowRight from '@/components/icons/ArrowRight'

export const metadata: Metadata = {
    title: 'Servizi | 💻 Sviluppo Siti Web & Project Management 🚀',
    description: 'I miei servizi di web design e sviluppo: creazione di siti web su misura, sviluppo temi e plugin WordPresse gestione progetti per aziende e web agency.',
}

export default function WebDesignServices() {

    const experience = new Date().getFullYear() - 2010

    return (
        <>
            <Header />

            <section className='py-10 md:py-16 lg:py-20'>
                <div className='container'>
                    <h1 className='text-black'><span className='lg:text-6xl'>Servizi di design e sviluppo web</span></h1>
                    <p className='my-6'>Dalla progettazione alla realizzazione, sviluppo siti web moderni, intuitivi e performanti per ogni settore, oltre a temi e plugin personalizzati per WordPress.</p>
                </div>
            </section>

            <section className='pb-10 md:pb-16 lg:pb-20' id='servizi'>
                <div className='container'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
                        <div className='md:col-span-2 bg-gray-100 rounded-2xl p-4 md:p-6'>
                            <h2>Siti web</h2>
                            <p>Realizzo siti web personalizzati, ottimizzati per prestazioni e <ToolTip text={'La SEO (Search Engine Optimization) ottimizza un sito per apparire tra i primi risultati su Google; migliorando contenuti, struttura, velocità e link esterni si può aumentare la visibilità senza pagare per la pubblicità.'}>SEO</ToolTip>, con un design moderno e funzionale. Che si tratti di siti vetrina, e-commerce o soluzioni su misura, garantisco un'esperienza utente fluida ed intuitiva.</p>
                            <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici'} className='btn-empty-primary text-black mt-3'>Scopri di più <ArrowRight /></Link>
                        </div>
                        <Link className='bg-black rounded-2xl h-full flex items-center hover:opacity-75 p-4 md:p-6' href={'#lavoriamo-assieme'} title='Lavoriamo assieme'>
                            <div>
                                <h4 className='text-bd-green font-semibold'>Ottieni il massimo</h4>
                                <p className='text-white m-0 text-sm'>Raggiungi i tuoi potenziali clienti con un sito <strong className='text-bd-green'>professionale</strong>, performante e che funziona davvero.</p>
                            </div>
                            <div>
                                <ArrowRight width={50} height={50} className='text-bd-green' />
                            </div>
                        </Link>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 my-8'>
                        <div className='md:col-span-2 bg-gray-100 rounded-2xl p-4 md:p-6'>
                            <h2>Temi e plugin per WordPress</h2>
                            <p>Sviluppo temi e plugin personalizzati per WordPress, perfettamente integrati con il tuo sito e ottimizzati per velocità, sicurezza e compatibilità. Creazioni su misura per migliorare funzionalità e design in base alle tue esigenze.</p>
                            <Link href={'/servizi/realizzazione-temi-e-plugin-per-wordpress'} className='btn-empty-primary text-black mt-3'>Scopri di più <ArrowRight /></Link>
                        </div>
                        <Link className='bg-bd-green rounded-2xl h-full flex items-center hover:opacity-75 p-4 md:p-6' href={'#lavoriamo-assieme'} title='Lavoriamo assieme'>
                            <div>
                                <h4 className='text-black font-semibold'>Arricchisci il tuo sito</h4>
                                <p className='text-black m-0 text-sm'>Strumenti professionali realizzati <strong>su misura per te</strong>, senza funzioni inutili e senza peggiorare le prestazioni.</p>
                            </div>
                            <div>
                                <ArrowRight width={50} height={50} className='text-black' />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>


            <section className='bg-gray-100 py-10 md:py-16 lg:py-20 mb-10 md:mb-16 lg:mb-20'>
                <div className='container'>
                    <h2 className='lg:text-4xl text-black'>Collaborazioni con web agency</h2>
                    <p className='mb-8'>In oltre {experience} anni di esperienza, ho lavorato e collaborato con diverse agenzie di marketing in Italia, Austria e Germania. Posso lavorare da solo, gestendo il progetto dall'inizio alla fine, oppure integrarmi nel team della tua agenzia, anche se multilingue: oltre all'italiano, parlo fluentemente inglese, tedesco e spagnolo.</p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12'>
                        <Link className='bg-bd-green text-black rounded-2xl p-4 md:p-6 hover:opacity-75 flex flex-col justify-between' href={'/servizi/sviluppatore-freelance-per-web-agencies'} title='Sviluppatore freelance per web agencies'>
                            <div>
                                <h3>Come risorsa esterna</h3>
                                <p>Se la tua agenzia ha bisogno di un supporto flessibile, posso sia gestire il progetto al 100% che affiancare il tuo team come risorsa esterna. Lavoro in sinergia con il team, adattandomi ai flussi di lavoro esistenti e garantendo un contributo efficace senza stravolgere i processi aziendali.</p>
                            </div>
                            <span className='btn-empty-primary text-black mt-3 flex justify-center'>Scopri di più <ArrowRight /></span>
                        </Link>
                        <Link className='bg-black text-white rounded-2xl p-4 md:p-6 hover:opacity-75 flex flex-col justify-between' href={'/servizi/project-manager-freelance-per-web-agencies'} title='Project manager freelance per web agencies'>
                            <h3 className='text-bd-green'>Come project manager</h3>
                            <p>Se cerchi una figura in grado di gestire l'intero ciclo di vita di un progetto, posso assumere il ruolo di project manager, coordinando risorse, tempi e obiettivi. Mi occupo della pianificazione strategica, del monitoraggio delle attività e della comunicazione tra clienti e team di sviluppo, assicurando che ogni fase venga completata con precisione e nei tempi previsti.</p>
                            <span className='btn-empty-secondary border-white text-white mt-3 flex justify-center'>Scopri di più <ArrowRight /></span>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}
