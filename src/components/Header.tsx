'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import ArrowRight from '@/components/icons/ArrowRight'
import Close from '@/components/icons/Close'
import Envelope from '@/components/icons/Envelope'
import Facebook from '@/components/icons/Facebook'
import Instagram from '@/components/icons/Instagram'
import LinkedIn from '@/components/icons/LinkedIn'
import Phone from '@/components/icons/Phone'
import Support from '@/components/icons/Support'
import Whatsapp from '@/components/icons/Whatsapp'


export default function Header() {

    const [isOpen, setOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    const toggleMenu = () => {
        setOpen(!isOpen)
    }

    const closeMenu = () => {
        setOpen(false)
    }

    useEffect(() => {

        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, []);

    return (
        <>
            <div className='bg-black py-2'>
                <div className='container text-xs flex justify-between'>
                    <Link className='text-bd-green items-center gap-1 hidden sm:flex' href={'mailto:antonio@bortolin.dev'} title={'Scrivimi un\'e-mail'}>
                        <Envelope width={16} height={16} />
                        <span>antonio@bortolin.dev</span>
                    </Link>
                    <div className='flex gap-3'>
                        <Link className='text-bd-green flex items-center gap-1' href={'tel:+393715962874'} title='Chiamami adesso'>
                            <Phone width={16} height={16} />
                            <span>+39 371 596 2874</span>
                        </Link>
                        <Link className='text-bd-green flex items-center gap-1' href={'https://wa.me/message/YPJNFZYIJD6WK1'} title={'Contattami con WhatsApp'} target='_blank' rel='noreferrer noopener'>
                            <Whatsapp width={16} height={16} className='fill-bd-green' />
                            <span>WhatsApp</span>
                        </Link>
                    </div>
                </div>
            </div>
            <header className={`bg-white sticky py-4 md:py-3 top-0 w-full z-30 transition-all duration-150 ease-in-out ${isScrolled ? 'shadow-lg' : ''}`}>
                <div className='container flex items-center justify-between'>
                    <Link href={'/'} title='Pagina iniziale: bortolin.dev'>
                        <div className='text-xl md:text-2xl lg:text-3xl font-bold text-black flex items-center'>bortolin<div className='bg-bd-green w-14 h-14 rounded-full text-xl flex justify-center items-center'>.dev</div></div>
                    </Link>
                    <div className='flex items-center justify-between'>
                        <nav
                            className={`${isOpen ?
                                'top-0 left-0 z-20 w-screen md:w-full h-screen md:h-full bg-white opacity-100 overflow-visible' :
                                'top-0 left-0 w-0 md:w-full h-0 md:h-full opacity-0 md:opacity-100 overflow-hidden md:overflow-visible'
                                } fixed md:relative flex items-center justify-center md:justify-between transition-opacity duration-300`}
                        >
                            <div className='md:hidden absolute top-0 left-0 w-full px-4 py-4 md:py-3 flex justify-between'>
                                <Link href={'/'} title='Pagina iniziale: bortolin.dev'>
                                    <div className='text-xl md:text-2xl lg:text-3xl font-bold text-black flex items-center'>bortolin<div className='bg-bd-green w-14 h-14 rounded-full text-xl flex justify-center items-center'>.dev</div></div>
                                </Link>
                                <button className='' onClick={toggleMenu}>
                                    <Close width={30} height={30} />
                                    <span className='sr-only'>Chiudi menù</span>
                                </button>
                            </div>
                            <ul className='flex flex-col md:flex-row md:justify-center md:items-center gap-5'>
                                <li className='py-2 text-lg md:text-base' onClick={closeMenu}>
                                    <Link href={'/#chi-sono'}>Chi sono</Link>
                                </li>
                                <li className='submenu' onClick={closeMenu}>
                                    <Link href={'/servizi'}>Servizi</Link>
                                    <ul>
                                        <li className='pb-2' onClick={closeMenu}>
                                            <Link href={'/servizi/realizzazione-siti-web-statici-e-dinamici'}>Siti web</Link>
                                        </li>
                                        <li onClick={closeMenu}>
                                            <Link href={'/servizi/realizzazione-temi-e-plugin-per-wordpress'}>Temi e plugin per Wordpress</Link>
                                        </li>
                                        <li className='mt-4 mb-2'><strong>Per web agencies:</strong></li>
                                        <li className='pb-2' onClick={closeMenu}>
                                            <Link href={'/servizi/sviluppatore-freelance-per-web-agencies'}>Sviluppo progetti</Link>
                                        </li>
                                        <li onClick={closeMenu}>
                                            <Link href={'/servizi/project-manager-freelance-per-web-agencies'}>Project manager</Link>
                                        </li>
                                    </ul>
                                </li>
                                <li className='py-2' onClick={closeMenu}>
                                    <Link className='btn-primary' href={'#lavoriamo-insieme'} title='Lavoriamo insieme'>Lavoriamo insieme <ArrowRight /></Link>
                                </li>
                            </ul>
                            <ul className='md:hidden absolute bottom-20 left-0 w-full'>
                                <li>
                                    <Link className='font-semibold flex items-center gap-1.5 my-2 justify-center' href={'mailto:antonio@bortolin.dev'}><Envelope width={24} height={24} /> antonio@bortolin.dev</Link>
                                </li>
                                <li>
                                    <Link className='font-semibold flex items-center gap-1.5 mb-2 justify-center' href={'tel:+393715962874'}><Phone width={24} height={24} /> +39 371 596 2874</Link>
                                </li>
                            </ul>
                            <ul className='md:hidden absolute bottom-8 left-0 w-full flex items-center justify-center gap-4'>
                                <li>
                                    <Link href={'https://facebook.com'} title='Seguimi su Facebook' target='_blank'><Facebook /></Link>
                                </li>
                                <li>
                                    <Link href={'https://instagram.com'} title='Seguimi su Instagram' target='_blank'><Instagram /></Link>
                                </li>
                                <li>
                                    <Link href={'https://linkedin.com'} title='Seguimi su LinkedIn' target='_blank'><LinkedIn /></Link>
                                </li>
                            </ul>
                        </nav>
                        <Link className='bg-bd-green rounded-full p-3 md:hidden mr-3' href={'#contatti'} title='Vai ai contatti'>
                            <span className='sr-only'>Vai ai contatti</span>
                            <Support />
                        </Link>
                        <button className='md:hidden' onClick={toggleMenu}>
                            <div className='flex flex-col gap-1.5 justify-center items-end'>
                                <div className='h-[1.5px] w-8 bg-black rounded'></div>
                                <div className='h-[1.5px] w-5 bg-black rounded'></div>
                                <div className='h-[1.5px] w-6 bg-black rounded'></div>
                            </div>
                            <span className='sr-only'>Chiudi menù</span>
                        </button>
                    </div>
                </div>
            </header>
        </>
    )
}
