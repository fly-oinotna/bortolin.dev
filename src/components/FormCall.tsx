'use client'

import React, { useState } from 'react'

declare global {
  interface Window {
    gtag_report_conversion: (url?: string) => void
  }
}

function ContactForm() {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]

    const [date, setDate] = useState(formattedDate)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [time, setTime] = useState('08:30')
    const [consent, setConsent] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!name || !email || !time || !date || !consent) {
            setError('Tutti i campi sono obbligatori e devi accettare l\'informativa sulla privacy.')
            return
        }

        setError('')
        setSuccess('')

        const data = { name, email, date, time }

        try {
            const response = await fetch('/api/call-me', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                setSuccess('La tua richiesta è stata inviata con successo. Riceverai una conferma via email.')
                setName('')
                setEmail('')
                setDate(formattedDate)
                setTime('08:30')
                setConsent(false)
                if (typeof window !== 'undefined' && typeof window.gtag_report_conversion === 'function') {
                    window.gtag_report_conversion()
                    console.log('conversion')
                }
            } else {
                const res = await response.json()
                throw new Error(res.error || 'Si è verificato un errore durante l\'invio della richiesta.')
            }
        } catch (error) {
            setError('Si è verificato un errore. Riprova più tardi.')
        }
    }

    return (
        <form className='p-4' onSubmit={handleSubmit}>
            <fieldset className='grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-6 lg:gap-x-8'>
                <legend className='lg:col-span-2 text-xl font-semibold mb-6'>Richiedi consulenza gratuita</legend>
                <div>
                    <label className='block text-xs text-gray-600 pb-1' htmlFor="callmeback_name">Nome e cognome</label>
                    <input
                        className='block w-full p-2 rounded-lg border border-gray-200'
                        type="text"
                        id="callmeback_name"
                        name="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className='block text-xs text-gray-600 pb-1' htmlFor="callmeback_email">Indirizzo e-mail</label>
                    <input
                        className='block w-full p-2 rounded-lg border border-gray-200'
                        type="email"
                        id="callmeback_email"
                        name="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <p className='lg:col-span-2 m-0'>Richiedi una <strong>consulenza gratuita</strong>: scegli data e ora ed attendi la conferma al tuo indirizzo e-mail.</p>
                <div>
                    <label className='block text-xs text-gray-600 pb-1' htmlFor="callmeback_date">Data</label>
                    <input
                        type="date"
                        id="callmeback_date"
                        className='block w-full p-2 rounded-lg border border-gray-200'
                        min={formattedDate}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className='block text-xs text-gray-600 pb-1' htmlFor="callmeback_time">Orario</label>
                    <select
                        id="callmeback_time"
                        className='block w-full p-2.5 rounded-lg border border-gray-200'
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    >
                        {['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                        ))}
                    </select>
                </div>
                <div className='lg:col-span-2 flex items-center gap-2'>
                    <label className='flex items-center cursor-pointer'>
                        <div className={`relative w-10 h-6 rounded-full transition-all ${consent ? 'bg-bd-green' : 'bg-gray-300'}`} onClick={() => setConsent(!consent)}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${consent ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                    <span className='text-xs text-gray-600'>
                        Acconsento che i miei dati vengano memorizzati e riutilizzati per l'elaborazione della mia richiesta e dichiaro di aver letto e accettato l'
                        <a href='/informativa-sulla-privacy' title='Privacy Policy' target='_blank' rel='noreferrer noopener' className='text-black underline'>informativa sulla privacy</a>.
                    </span>
                </div>
                <div>
                    <button className='btn-primary' type='submit'>Invia richiesta</button>
                </div>
                {error && <div className='lg:col-span-2 border-red-700 text-red-700 bg-red-100 p-4 rounded-lg text-xs mb-4'>{error}</div>}
                {success && <div className='lg:col-span-2 border border-green-700 text-green-700 bg-green-100 p-4 rounded-lg text-xs mb-4'>{success}</div>}
            </fieldset>
        </form>
    )
}

export default ContactForm