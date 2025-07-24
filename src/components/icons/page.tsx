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
    title: 'Project Manager Freelance per Agenzie Web | Gestione Siti e App',
    description: 'Gestione professionale di progetti web per agenzie: mi occupo del team, del cliente e della consegna puntuale di siti e applicazioni personalizzate.',
    keywords: [
        'project manager freelance',
        'project manager agenzia web',
        'gestione progetti web',
        'freelance per agenzie',
        'realizzazione siti web',
        'applicazioni web su misura',
        'project manager esterno'
    ]
}

export default function ProjectManagerFreelance() {

    const faqs = [
        {
            question: 'Con quali tipi di progetti lavori?',
            answer: 'Gestisco progetti digitali complessi come siti aziendali, e-commerce, applicazioni web su misura, CRM e portali su misura. Collaboro con il team tecnico e grafico per garantire un risultato finale impeccabile.'
        },
        {
            question: 'Ti occupi anche del rapporto con il cliente?',
            answer: 'Sì. Mi interfaccio direttamente con il cliente, gestendo le comunicazioni, le richieste, le revisioni e tutte le fasi di progetto, mantenendo sempre la visione d’insieme e le priorità chiare.'
        },
        {
            question: 'Lavori con team interni o esterni all’agenzia?',
            answer: 'Posso coordinare sia team interni all’agenzia che collaboratori esterni. Mi adatto alla struttura esistente, garantendo una comunicazione fluida e un flusso di lavoro ben organizzato.'
        },
        {
            question: 'Quanto costa il tuo servizio di project management?',
            answer: 'Il costo è sempre concordato a progetto o a pacchetto, senza sorprese. L’obiettivo è fornire un servizio professionale ad un prezzo chiaro e prestabilito, in base alla complessità del lavoro.'
        },
        {
            question: 'Posso coinvolgerti solo in una fase del progetto?',
            answer: 'Sì. Puoi contattarmi per la sola pianificazione, la gestione dello sviluppo o anche per l’assistenza post-lancio. Definiamo insieme i confini della collaborazione in base alle tue esigenze.'
        }
    ]

    return (
        <>
            <Header />

            <section className='py-10 md:py-16 lg:py-20'>
                <div className='container grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12'>
                    <div className='lg:col-span-3'>
                        <h1 className='text-black leading-4'><span className='text-sm font-normal'>Project manager freelance per agenzie web</span></h1>
                        <h2 className='text-black'><span className='lg:text-6xl'>Gestione completa di progetti digitali</span></h2>
                        <p className='my-6'>Gestisco progetti digitali per agenzie che vogliono esternalizzare la figura del project manager. Mi occupo del team, del cliente e di tutte le fasi operative per garantire risultati concreti, precisi e consegne nei tempi previsti.</p>
                        <div className='flex items-center gap-4'>
                            <Link className='btn-secondary' href={'#lavoriamo-assieme'} title='Contattami'>Contattami <ArrowRight /></Link>
                            <Link href={'#faq'} title='FAQs'>Domande frequenti</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className='pb-10 md:pb-16 lg:pb-20'>
                <div className='container'>
                    <h2>I vantaggi di affidarmi la gestione del progetto</h2>
                    <ul className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-6'>
                        <li className='border-8 border-black bg-black text-white rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Speed width={80} height={80} className='fill-bd-green mx-auto' />
                            <h3 className='text-lg mt-3'>Puntualità</h3>
                            <p className='text-sm mb-0'>Organizzazione precisa e roadmap definite per rispettare ogni scadenza.</p>
                        </li>
                        <li className='border-8 border-bd-green rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Design width={80} height={80} className='mx-auto' />
                            <h3 className='text-lg mt-3'>Controllo totale</h3>
                            <p className='text-sm mb-0'>Coordinamento efficace di sviluppatori, designer e stakeholder.</p>
                        </li>
                        <li className='border-8 border-bd-green bg-bd-green rounded-3xl flex flex-col items-center p-6 text-center'>
                            <Accessibility width={80} height={80} className='fill-black mx-auto' />
                            <h3 className='text-lg mt-3'>Comunicazione fluida</h3>
                            <p className='text-sm mb-0'>Unico interlocutore per cliente e team, con aggiornamenti chiari e costanti.</p>
                        </li>
                        <li className='border-8 border-gray-100 bg-gray-100 rounded-3xl flex flex-col items-center p-6 text-center'>
                            <SEO width={80} height={80} className='fill-black mx-auto' />
                            <h3 className='text-lg mt-3'>Prezzo fisso</h3>
                            <p className='text-sm mb-0'>Collaborazione definita in anticipo, senza sorprese economiche in corso d’opera.</p>
                        </li>
                    </ul>
                </div>
            </section>

            <section>
                <div className='container grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 xl:gap-24'>
                    <div>
                        <h2 className='text-black'>Gestione end-to-end del progetto</h2>
                        <p>Mi occupo di ogni fase: dalla raccolta dei requisiti fino al lancio. Coordino team interni ed esterni, gestisco tempistiche, priorità, aspettative e budget, garantendo risultati concreti e misurabili.</p>
                        <p className='m-0'>Il mio approccio è orientato alla qualità e alla chiarezza: niente fronzoli, solo organizzazione solida e obiettivi chiari. Ogni progetto è un percorso condiviso verso il risultato finale.</p>
                    </div>
                    <div>
                        <h2 className='text-black'>Supporto per agenzie digitali</h2>
                        <p>Collaboro con agenzie che cercano un project manager esterno affidabile e competente. Sono la figura ponte tra il team operativo e il cliente, riducendo incomprensioni, rallentamenti e overload di comunicazione.</p>
                        <p className='m-0'>Conoscendo i processi di sviluppo web e UX, posso parlare sia la lingua tecnica che quella commerciale. Questo garantisce fluidità e coerenza in ogni fase del lavoro.</p>
                    </div>
                </div>
            </section>

            <section className='container py-10 md:py-16 lg:py-20'>
                <div className='bg-bd-green rounded-3xl p-4 md:p-6 lg:p-8 text-center'>
                    <h2 className='text-black'>Hai bisogno di un project manager freelance?</h2>
                    <p>Ti affidi a un professionista che conosce le dinamiche delle agenzie.<br />Gestisco progetti web con metodo, visione e precisione.</p>
                    <Link className='btn-secondary mt-2' href={'#lavoriamo-assieme'} title='Contattami'>Parliamone <ArrowRight /></Link>
                </div>
            </section>

            <section className='bg-gray-100 py-10 md:py-16 lg:py-20 mb-10 md:mb-16 lg:mb-20' id='faq'>
                <div className='container'>
                    <h2 className='lg:text-4xl text-black mb-8'>Domande Frequenti</h2>
                    <FAQ faqs={faqs} />
                </div>
            </section>

            <Footer />
        </>
    )
}
