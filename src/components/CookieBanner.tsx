'use client'

import { useEffect, useState } from 'react'
import { updateConsent } from '@/lib/gtm'

const storageKey = 'cookie_consent'
const GTM_ID = 'GTM-M87QWFCB'

type ConsentSettings = {
    necessary: boolean
    marketing: boolean
    analytics: boolean
}

function loadGTM(id: string) {
    if (document.getElementById('gtm-script')) return

    const script = document.createElement('script')
    script.id = 'gtm-script'
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`
    script.async = true
    document.head.appendChild(script)

    const noscript = document.createElement('noscript')
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
    document.body.appendChild(noscript)
}

export default function CookieBanner() {
    const [visible, setVisible] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [settings, setSettings] = useState<ConsentSettings>({
        necessary: true,
        marketing: true,
        analytics: true,
    })

    useEffect(() => {
        const consent = localStorage.getItem(storageKey)
        if (!consent) {
            setVisible(true)
        } else {
            const parsed = JSON.parse(consent)
            if (parsed.marketing || parsed.analytics) loadGTM(GTM_ID)
        }
    }, [])

    const acceptAll = () => {
        updateConsent({
            ad_storage: 'granted',
            analytics_storage: 'granted',
        })
        localStorage.setItem(storageKey, JSON.stringify({ marketing: true, analytics: true }))
        loadGTM(GTM_ID)
        setVisible(false)
    }

    const declineAll = () => {
        updateConsent({
            ad_storage: 'denied',
            analytics_storage: 'denied',
        })
        localStorage.setItem(storageKey, JSON.stringify({ marketing: false, analytics: false }))
        setVisible(false)
    }

    const savePreferences = () => {
        updateConsent({
            ad_storage: settings.marketing ? 'granted' : 'denied',
            analytics_storage: settings.analytics ? 'granted' : 'denied',
        })
        localStorage.setItem(storageKey, JSON.stringify(settings))
        if (settings.marketing || settings.analytics) loadGTM(GTM_ID)
        setVisible(false)
        setShowSettings(false)
    }

    const toggle = (key: keyof ConsentSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md rounded-xl bg-white p-4 shadow-2xl">
            {!showSettings ? (
                <>
                    <p className='text-xl font-semibold'>Cookies</p>
                    <p className="text-sm text-gray-800 mb-3">
                        Ciao! 😊<br /><br />
                        Usiamo i cookie per rendere la tua visita sul nostro sito più piacevole e su misura per te. Con i cookie possiamo ricordarci delle tue preferenze, mostrarti contenuti interessanti e migliorare continuamente la tua esperienza.<br /><br />
                        Puoi scegliere quali cookie accettare, oppure dire “no grazie” a quelli che non vuoi. Se vuoi saperne di più o cambiare idea, le impostazioni sono sempre a portata di clic.<br /><br />
                        Grazie per essere qui con noi! 💚
                    </p>
                    <div className="flex gap-2 pt-4">
                        <button onClick={acceptAll} className="btn btn-primary">
                            Accetta tutti
                        </button>
                        <button
                            onClick={declineAll}
                            className="border border-black rounded-full px-6 py-2.5 text-base font-medium inline-flex items-center hover:opacity-75 hover:scale-105 transition-all duration-300 shadow"
                        >
                            Rifiuta tutti
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="text-sm underline text-gray-600"
                        >
                            Impostazioni
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-xl font-semibold text-gray-800 mb-3">Preferenze cookie</p>
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <div>
                            <label className="text-base font-semibold text-gray-700">Necessari</label>
                            <p className='text-xs'>Questi cookie sono necessari per il corretto funzionamento del nostro sito web e non possono essere disattivati nel nostro sistema.</p>
                        </div>
                        <label
                            htmlFor="necessary-toggle"
                            className="relative inline-flex cursor-pointer items-center"
                        >
                            <input
                                type="checkbox"
                                id="analytics-toggle"
                                className="peer sr-only"
                                checked={settings.necessary}
                                onChange={() => toggle('necessary')}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-bd-green transition-colors opacity-50" />
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md peer-checked:translate-x-5 transition-transform" />
                        </label>
                    </div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <div>
                            <label className="text-base font-semibold text-gray-700">Analytics</label>
                            <p className='text-xs'>Utilizziamo questi cookie per fornire informazioni statistiche sul nostro sito web. Vengono utilizzati per misurare e migliorare le prestazioni.</p>
                        </div>
                        <label
                            htmlFor="analytics-toggle"
                            className="relative inline-flex cursor-pointer items-center"
                        >
                            <input
                                type="checkbox"
                                id="analytics-toggle"
                                className="peer sr-only"
                                checked={settings.analytics}
                                onChange={() => toggle('analytics')}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-bd-green transition-colors" />
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md peer-checked:translate-x-5 transition-transform" />
                        </label>
                    </div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <div>
                            <label className="text-base font-semibold text-gray-700">Marketing</label>
                            <p className='text-xs'>Questi cookie vengono impostati dai nostri partner pubblicitari sul nostro sito web. I dati vengono raccolti al fine di personalizzare la pubblicità e misurare l'efficacia delle campagne pubblicitarie. I dati possono essere condivisi con Google LLC, ulteriori informazioni sono disponibili <a className='underline' href='https://business.safety.google/privacy/' target='_blank' rel='noopener nofollow'>qui</a>.</p>
                        </div>
                        <label
                            htmlFor="marketing-toggle"
                            className="relative inline-flex cursor-pointer items-center"
                        >
                            <input
                                type="checkbox"
                                id="marketing-toggle"
                                className="peer sr-only"
                                checked={settings.marketing}
                                onChange={() => toggle('marketing')}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-bd-green transition-colors" />
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md peer-checked:translate-x-5 transition-transform" />
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={savePreferences}
                            className="btn btn-secondary"
                        >
                            Salva preferenze
                        </button>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="text-sm underline text-gray-600"
                        >
                            Indietro
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
