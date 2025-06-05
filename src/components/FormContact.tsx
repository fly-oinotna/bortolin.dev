'use client'

import React, { useState } from 'react'

function ContactForm() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [consent, setConsent] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!name || !email || !message || !consent) {
            setError('Tutti i campi sono obbligatori e devi accettare l\'informativa sulla privacy.')
            return
        }

        setError('')
        setSuccess('')

        const data = { name, email, message }

        try {
            const response = await fetch('/api/contact', {
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
                setMessage('')
            } else {
                throw new Error('Errore nella richiesta')
            }
        } catch (error) {
            setError('Si è verificato un errore. Riprova più tardi.')
        }
    }

    return (
        <form className='p-4' onSubmit={handleSubmit}>
            <fieldset className='grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-6 lg:gap-x-8'>
                <legend className='lg:col-span-2 text-xl font-semibold mb-6'>Invia un messaggio</legend>
                <div>
                    <label className='block text-xs text-gray-600 pb-1' htmlFor='name'>Nome e cognome</label>
                    <input className='block w-full p-2 rounded-lg border border-gray-200' type='text' id='name' required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label className='block text-xs text-gray-600 pb-1' htmlFor='email'>Indirizzo e-mail</label>
                    <input className='block w-full p-2 rounded-lg border border-gray-200' type='email' id='email' required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className='lg:col-span-2'>
                    <label className='block text-xs text-gray-600 pb-1' htmlFor='message'>Messaggio</label>
                    <textarea id='message' className='block w-full p-2 rounded-lg border border-gray-200' rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <div className='lg:col-span-2 flex items-center gap-2'>
                    <label htmlFor='consent' className='flex items-center cursor-pointer'>
                        <div className={`relative w-10 h-6 rounded-full transition-all ${consent ? 'bg-bd-green' : 'bg-gray-300'}`} onClick={() => setConsent(!consent)}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${consent ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                    <span className='text-xs text-gray-600'>
                        Acconsento che i miei dati vengano memorizzati e riutilizzati per l'elaborazione della mia richiesta e dichiaro di aver letto e accettato l'
                        <a href='/informativa-sulla-privacy' target='_blank' rel='noreferrer noopener' className='text-black underline'>informativa sulla privacy</a>.
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
