'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import ArrowRight from '@/components/icons/ArrowRight'
import Close from '@/components/icons/Close'

export default function ExplodingModal() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    return (
        <>
            <button
                onClick={openModal}
                className='btn-empty-primary text-black mt-3'
            >
                Scopri di più <ArrowRight />
            </button>

            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Background Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className='fixed inset-0 bg-black z-40'
                            onClick={closeModal} // Close modal on background click
                        />

                        {/* Modal Wrapper */}
                        <div className='fixed top-4 lg:top-12 right-4 lg:right-12 bottom-4 lg:bottom-12 left-4 lg:left-12 z-50 flex items-center justify-center'>
                            {/* Modal Content */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                    duration: 0.5,
                                }}
                                className='relative w-full h-full bg-white rounded-xl lg:rounded-3xl shadow-lg p-6 flex flex-col overflow-hidden'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className='sticky w-full top-0 right-0 z-10 mb-5 flex justify-between'>
                                    <span className='text-2xl font-semibold leading-normal lg:text-4xl text-black'>Siti web</span>
                                    <button
                                        onClick={closeModal}
                                    >
                                        <Close width={20} height={20} className='fill-gray-400' />
                                    </button>
                                </div>
                                <div className='overflow-y-auto mt-4 pr-4 styled-scrollbar'>
                                    <h2 className='font-bold'>Highlights</h2>
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
                                        <div className='bg-gray-100 rounded-2xl p-4 md:p-6'>
                                            <h3>Prestazioni garantite</h3>
                                            <p>Velocità di caricamento, Velocità di caricamento, Velocità di caricamento, Velocità di caricamento</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
