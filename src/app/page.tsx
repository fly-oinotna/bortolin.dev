import type { Metadata } from 'next'

import Link from 'next/link'
import Image from 'next/image'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

import Counter from '@/components/Counter'
import ToolTip from '@/components/ToolTip'

import ArrowRight from '@/components/icons/ArrowRight'
import Certificate from '@/components/icons/Certificate'

export const metadata: Metadata = {
  title: 'Bortolin.dev | 💻 Sviluppo Siti Web & Project Management 🚀',
  description: 'Sviluppo siti web e gestione progetti per privati, aziende e web agency. 🌐 Soluzioni personalizzate per ogni esigenza! 📈',
}

export default function Home() {

  const experience = new Date().getFullYear() - 2010
  const projects = 300

  return (
    <>
      <Header />

      <section className='pt-10 md:pt-16 lg:pt-20 pb-16 md:pb-24 lg:pb-32'>
        <div className='container grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12'>
          <div className='lg:col-span-3'>
            <h1 className='text-black leading-4'><span className='text-sm font-normal'>Web designer & developer per piccole e medie imprese, privati e web agencies</span></h1>
            <h2 className='text-black'><span className='lg:text-6xl'>Siti internet veloci e sicuri che rappresentano al meglio la presenza online della tua azienda</span></h2>
            <p className='my-6'>Offro soluzioni su misura per la tua presenza online, combinando siti web innovativi e strategie di marketing online collaudate per posizionare con successo la tua azienda nel mondo digitale.</p>
            <div className='flex items-center gap-4'>
              <Link className='btn-secondary' href={'#lavoriamo-insieme'} title='Lavoriamo insieme'>Lavoriamo insieme <ArrowRight /></Link>
              <Link href={'/#chi-sono'} title='Chi sono'>Chi sono</Link>
            </div>
          </div>
          <div className='lg:col-span-2 grid grid-cols-2 grid-rows-2 gap-4 lg:gap-6'>
            <div className='bg-gray-100 rounded-3xl flex flex-col items-center justify-center'>
              <p className='m-0 text-center'>
                Oltre
                <span className='block text-3xl md:text-4xl lg:text-5xl text-black font-bold'><Counter countTo={projects} /></span>
                progetti
              </p>
            </div>
            <div className='bg-bd-green rounded-3xl flex flex-col items-center justify-center'>
              <p className='m-0 text-center'>
                <span className='block text-3xl md:text-4xl lg:text-5xl text-black font-bold'><Counter countTo={experience} speed={100} /></span>
                Anni di esperienza
              </p>
            </div>
            <div className='col-span-2 bg-black rounded-3xl p-4 md:p-6'>
              <h3 className='text-bd-green'>Zero soprese</h3>
              <p className='text-white m-0 text-sm'>Patti chiari, amicizia lunga: fornisco un preventivo dettagliato ad ogni progetto che seguo; il preventivo stabilirà da subito le <strong className='text-bd-green'>funzionalità incluse</strong>, i <strong className='text-bd-green'>tempi di consegna</strong> e, soprattutto, <strong className='text-bd-green'>il prezzo</strong>. L'importo in fattura sarà indentico a quello del preventivo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className='bg-gray-100 py-10 md:py-16 lg:py-20' id='chi-sono'>
        <div className='container grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center'>
          <div className='lg:col-span-2 lg:order-2'>
            <Image className='w-full h-auto aspect-square object-cover rounded-2xl' src={'/images/antonio-bortolin-design-e-sviluppo-web.webp'} alt='bortolin.dev' width={500} height={500} priority />
          </div>
          <div className='lg:col-span-3 lg:order-1'>
            <h2 className='lg:text-4xl text-black mb-6'>Con chi lavorerai</h2>
            <p>Mi chiamo Antonio e sono uno sviluppatore e designer di siti web con oltre {experience} anni di esperienza. Ho lavorato per alcune web agencies all'estero, inizialmente come <em>junior developer</em>, poi come <em>senior developer </em>&nbsp;ed infine come <em>lead developer </em>&nbsp;(a capo del team di sviluppo); nel 2016 ho iniziato a collaborare con queste agenzie come freelancer sia con progetti singoli che con collaborazioni continuative.</p>
            <p>Sono friulano di origine ma vivo in Veneto e sono madrelingua italiano. In 11 anni all'estero, ho imparato a parlare fluentemente inglese, tedesco e spagnolo.</p>
            <p>Le mie passioni sono l'aviazione, il motociclismo, le escursioni nella natura ed il buon cibo.</p>
            <h3 className='mt-6'>Perché lavorare con me?</h3>
            <ul className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              <li className='flex gap-3'>
                <div>
                  <Certificate width={32} height={32} />
                </div>
                <span>Oltre {experience} anni di esperienza</span>
              </li>
              <li className='flex gap-3'>
                <div>
                  <Certificate width={32} height={32} />
                </div>
                <span>Più di {projects} progetti</span>
              </li>
              <li className='flex gap-3'>
                <div>
                  <Certificate width={32} height={32} />
                </div>
                <span>Prezzo stabilito e garantito</span>
              </li>
              <li className='flex gap-3'>
                <div>
                  <Certificate width={32} height={32} />
                </div>
                <span>Precisione e correttezza</span>
              </li>
            </ul>
            <div className='flex items-center gap-4 pt-8'>
              <Link className='btn-primary' href={'#lavoriamo-insieme'} title='Lavoriamo insieme'>Lavoriamo insieme <ArrowRight /></Link>
              <Link href={'/#servizi'} title='Servizi'>Scopri i servizi</Link>
            </div>
          </div>
        </div>
      </section>

      <section className='py-10 md:py-16 lg:py-20' id='servizi'>
        <div className='container'>
          <h2 className='lg:text-4xl text-black'>Servizi</h2>
          <p className='mb-8'>Un sito web moderno non deve essere solo esteticamente accattivante ed intuitivo, ma anche ottimizzato per offrire le migliori prestazioni. La velocità di caricamento, il posizionamento sui motori di ricerca e l’accessibilità da qualsiasi dispositivo sono elementi essenziali per il successo online. Un design curato, combinato con una solida strategia <ToolTip text={'La SEO (Search Engine Optimization) ottimizza un sito per apparire tra i primi risultati su Google; migliorando contenuti, struttura, velocità e link esterni si può aumentare la visibilità senza pagare per la pubblicità.'}>SEO</ToolTip> e una struttura performante, garantisce una presenza digitale efficace, in grado di attrarre e convertire visitatori in clienti.</p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-gray-100 rounded-2xl p-4 md:p-6'>
            <div className='md:col-span-2'>
              <h3>Siti web</h3>
              <p>Realizzo siti web personalizzati, ottimizzati per prestazioni e SEO, con un design moderno e funzionale. Che si tratti di siti vetrina, e-commerce o soluzioni su misura, garantisco un'esperienza utente fluida ed intuitiva.</p>
              <p>Nessuna sorpresa: il <strong>prezzo è fisso</strong> e stabilito sin dall'inizio!</p>
              <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici'} className='btn-empty-primary text-black mt-3'>Scopri di più <ArrowRight /></Link>
            </div>
            <Link className='bg-black rounded-2xl h-full flex items-center hover:opacity-75 p-4 md:p-6' href={'#lavoriamo-insieme'} title='Lavoriamo insieme'>
              <div>
                <h4 className='text-bd-green font-semibold'>Ottieni il massimo</h4>
                <p className='text-white m-0 text-sm'>Raggiungi i tuoi potenziali clienti con un sito <strong className='text-bd-green'>professionale</strong>, performante e che funziona davvero.</p>
              </div>
              <div>
                <ArrowRight width={50} height={50} className='text-bd-green' />
              </div>
            </Link>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-gray-100 rounded-2xl p-4 md:p-6 my-8'>
            <div className='md:col-span-2'>
              <h3>Temi e plugin per WordPress</h3>
              <p>Sviluppo temi e plugin personalizzati per WordPress, perfettamente integrati con il tuo sito e ottimizzati per velocità, sicurezza e compatibilità. Creazioni su misura per migliorare funzionalità e design in base alle tue esigenze.</p>
              <p>Anche qui, nessuna sorpresa: il <strong>prezzo è fisso</strong> e stabilito sin dall'inizio!</p>
              <Link href={'/servizi/realizzazione-temi-e-plugin-per-wordpress'} className='btn-empty-primary text-black mt-3'>Scopri di più <ArrowRight /></Link>
            </div>
            <Link className='bg-bd-green rounded-2xl h-full flex items-center hover:opacity-75 p-4 md:p-6' href={'#lavoriamo-insieme'} title='Lavoriamo insieme'>
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
          <p className='mb-8'>Offro soluzioni su misura per web agency che desiderano ottimizzare i propri processi e delegare progetti ad un partner serio e professionale. Che tu abbia bisogno di una risorsa esterna o di un project manager, garantisco competenza, efficienza e rispetto delle tempistiche.</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12'>
            <Link className='bg-bd-green text-black rounded-2xl p-4 md:p-6 hover:opacity-75' href={'/servizi/sviluppatore-freelance-per-web-agencies'} title='Sviluppatore freelance per web agencies'>
              <h3>Come risorsa esterna</h3>
              <p>Collaboro con web agency per sviluppare progetti in modo efficiente e senza stress. Mi occupo dell’intero processo, dall’ideazione allo sviluppo, garantendo qualità e rispetto delle scadenze. Che si tratti di siti web, e-commerce o soluzioni personalizzate, offro un supporto affidabile, permettendoti di concentrarti sulla crescita della tua agenzia senza sovraccaricare il team.</p>
              <span className='btn-empty-primary text-black mt-3'>Scopri di più <ArrowRight /></span>
            </Link>
            <Link className='bg-black text-white rounded-2xl p-4 md:p-6 hover:opacity-75' href={'/servizi/project-manager-freelance-per-web-agencies'} title='Project manager freelance per web agencies'>
              <h3 className='text-bd-green'>Come project manager</h3>
              <p>Gestisco progetti digitali per web agency, assicurando un flusso di lavoro efficiente tra cliente e team. Coordino le fasi di sviluppo, traducendo le esigenze in task chiari, monitorando tempi e risorse e prevenendo criticità. Il mio obiettivo è ottimizzare il processo, garantendo qualità, rispetto delle scadenze e una comunicazione fluida, senza doverti preoccupare degli aspetti operativi.</p>
              <span className='btn-empty-secondary border-white text-white mt-3'>Scopri di più <ArrowRight /></span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
