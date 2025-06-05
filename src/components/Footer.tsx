"use client"

import { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'

import FormCall from '@/components/FormCall'
import FormContact from '@/components/FormContact'

import ArrowRight from '@/components/icons/ArrowRight'
import Envelope from '@/components/icons/Envelope'
import Facebook from '@/components/icons/Facebook'
import Cookie from '@/components/icons/Cookie'
import LinkedIn from '@/components/icons/LinkedIn'
import Phone from '@/components/icons/Phone'


export default function Footer() {

    const [isFormCallActive, setIsFormCallActive] = useState(true)
    const [isFormContactActive, setIsFormContactActive] = useState(false)

    const [_, rerender] = useState(0)

    const reopenBanner = () => {
        localStorage.removeItem('cookie_consent')
        rerender(x => x + 1)
        location.reload()
    }

    return (
        <>
            <section className='container'>
                <div className='bg-bd-green rounded-3xl p-4 md:p-6 lg:p-8 text-center'>
                    <h2 className='text-black'>Aumenta la visibilità della tua azienda</h2>
                    <p>Affida la creazione del tuo sito web ad un partner serio e affidabile.<br />Ti aiuterò a creare una presenza online professionale che attragga clienti e faccia crescere il tuo business.<br /><strong>Non lasciare nulla al caso, scegli la qualità.</strong></p>
                    <Link className='btn-secondary mt-2' href={'#lavoriamo-assieme'} title='Lavoriamo assieme'>Lavoriamo assieme <ArrowRight /></Link>
                </div>
            </section>


            <section className='container pt-10 md:pt-16 lg:pt-20' id='lavoriamo-assieme'>
                <div className='bg-gray-100 rounded-3xl p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12'>
                    <div className='overflow-hidden'>
                        <h2 className='text-black'>Sono pronto a dar forma al tuo nuovo progetto</h2>
                        <div className={isFormCallActive ? 'translate-x-0 transition-transform duration-300 opacity-100 max-h-screen overflow-visible' : '-translate-x-full transition-transform duration-300 opacity-0 max-h-0 overflow-hidden'}>
                            <p>
                                Compila il modulo <span className='hidden md:inline-block'>a fianco</span><span className='md:hidden'>in basso</span> per prenotare un'appuntamento.<br />
                                <strong>La prima call conoscitiva di 15 minuti, per i nuovi clienti, è gratis!</strong>
                            </p>
                            <p className='mt-4 m-0'>Preferisci <button onClick={() => { setIsFormCallActive(false); setIsFormContactActive(true) }} className='font-bold underline'>mandare un messaggio</button>?</p>
                        </div>
                        <div className={isFormContactActive ? 'translate-x-0 transition-transform duration-300 opacity-100 max-h-screen overflow-visible' : '-translate-x-full transition-transform duration-300 opacity-0 max-h-0 overflow-hidden'}>
                            <p>
                                Compila il modulo <span className='hidden md:inline-block'>a fianco</span><span className='md:hidden'>in basso</span> per contattarmi specificando di cosa hai bisogno.<br />
                                <strong>Non vedo l'ora di conoscere il tuo progetto!</strong>
                            </p>
                            <p className='mt-4 m-0'>Preferisci <button onClick={() => { setIsFormCallActive(true); setIsFormContactActive(false) }} className='font-bold underline'>prenotare una call</button> gratuita di 15 minuti?</p>
                        </div>
                    </div>
                    <div className='md:col-span-2 overflow-hidden'>
                        <div className={isFormCallActive ? 'translate-x-0 transition-transform duration-300 opacity-100 max-h-screen overflow-visible' : 'translate-x-full transition-transform duration-300 opacity-0 max-h-0 overflow-hidden'}><FormCall /></div>
                        <div className={isFormContactActive ? 'translate-x-0 transition-transform duration-300 opacity-100 max-h-screen overflow-visible' : 'translate-x-full transition-transform duration-300 opacity-0 max-h-0 overflow-hidden'}><FormContact /></div>
                    </div>
                </div>
            </section>

            <footer className='container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pt-10 md:pt-16 lg:pt-20 pb-6 md:pb-8 lg:pb-10'>
                <div className='lg:col-span-2'>
                    <Link href={'/'} title='Pagina iniziale: bortolin.dev'>
                        <div className='text-xl md:text-2xl lg:text-3xl font-bold text-black flex items-center'>bortolin<div className='bg-bd-green w-14 h-14 rounded-full text-xl flex justify-center items-center'>.dev</div></div>
                    </Link>
                    <p className='my-4 text-sm lg:mr-24'>Sono uno sviluppatore web che collabora con aziende e web agency, creando soluzioni su misura e gestendo progetti e risorse per assicurare risultati di qualità.</p>
                    <Link className='font-semibold flex items-center gap-1.5 my-2' href={'mailto:antonio@bortolin.dev'} title={'Scrivimi un\'e-mail'}><Envelope width={24} height={24} /> antonio@bortolin.dev</Link>
                    <Link className='font-semibold flex items-center gap-1.5 mb-2' href={'tel:+393715962874'} title='Chiamami adesso'><Phone width={24} height={24} /> +39 371 596 2874</Link>
                    <ul className='flex items-center gap-1 pt-4'>
                        <li>
                            <Link href={'https://www.facebook.com/bortolin.dev'} title='Seguimi su Facebook' target='_blank'><Facebook /></Link>
                        </li>
                        <li>
                            <Link href={'https://www.linkedin.com/in/antonio-bortolin/'} title='Seguimi su LinkedIn' target='_blank'><LinkedIn /></Link>
                        </li>
                    </ul>
                </div>
                <div className='pt-1.5'>
                    <h3 className='mb-2.5 text-md'>Per aziende e privati</h3>
                    <ul className='text-sm'>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici'} title='Siti web statici e dinamici'>Sviluppo siti web statici e dinamici</Link>
                        </li>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/realizzazione-temi-e-plugin-per-wordpress'} title='Sviluppatore di plugin e temi Wordpress per web agencies'>Plugin & temi Wordpress</Link>
                        </li>
                    </ul>
                    <h3 className='mt-4 mb-2.5 text-md'>Per le web agencies</h3>
                    <ul className='text-sm'>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/sviluppatore-freelance-per-web-agencies'} title='Sviluppatore freelance per web agencies'>Sviluppatore freelance</Link>
                        </li>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/project-manager-freelance-per-web-agencies'} title='Project manager freelance per web agencies'>Project manager freelance</Link>
                        </li>
                    </ul>
                </div>
                <div className='pt-1.5'>
                    <h3 className='mb-2.5 text-md'>Sviluppo siti web</h3>
                    <ul className='text-sm'>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici-treviso-e-provincia'} title='Sviluppo siti web a Treviso e provincia'>A Treviso e provincia</Link>
                        </li>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici-venezia-e-provincia'} title='Sviluppo siti web a Venezia e provincia'>A Venezia e provincia</Link>
                        </li>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici-pordenone-e-provincia'} title='Sviluppo siti web a Pordenone e provincia'>A Pordenone e provincia</Link>
                        </li>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici-udine-e-provincia'} title='Sviluppo siti web a Udine e provincia'>A Udine e provincia</Link>
                        </li>
                        <li className='mb-1.5'>
                            <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici-triveneto'} title='Sviluppo siti web in Triveneto'>In Triveneto</Link>
                        </li>
                    </ul>
                </div>
                <div className='md:col-span-2 lg:col-span-4 text-center'>
                    <p className='text-xs text-center'>© {new Date().getFullYear()} Antonio Bortolin - P.IVA: IT05504860262</p>
                    <p className='text-xs text-center'><Link className='text-xs font-semibold' href={'/informativa-sulla-privacy'} title='Informativa sulla privacy'>Privacy policy</Link> - <Link className='text-xs font-semibold' href={'/informativa-sulla-gestione-dei-cookie'} title='Informativa sulla gestione dei cookies'>Cookies policy</Link></p>
                    <button onClick={reopenBanner} className="text-xs text-black mt-4 flex items-center justify-center mx-auto">
                        <Cookie width={20} height={20} /><span>Preferenze cookies</span>
                    </button>
                </div>
            </footer>
        </>
    );
}
