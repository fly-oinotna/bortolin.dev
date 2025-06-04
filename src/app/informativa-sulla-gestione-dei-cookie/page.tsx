import type { Metadata } from "next"

import Footer from '@/components/Footer'
import Header from '@/components/Header'

export const metadata: Metadata = {
    title: "🍪 Cookie Policy",
    robots: 'noindex, nofollow'
}

export default function CookiesPolicy() {
    return (
        <>
            <Header />
            <div className='container'>
                <div className='content'>
                    <h1 className='mb-10'>Cookie Policy</h1>
                    <p><strong>Ultimo aggiornamento:</strong> 3 giugno 2025</p>

                    <p>Questa è la Cookie Policy per il sito web di <strong>Antonio Bortolin</strong>. Utilizziamo i cookie per migliorare l'esperienza utente, analizzare il traffico e facilitare l'interazione con le funzionalità del sito, inclusi i moduli di contatto.</p>

                    <h2>1. Cosa sono i cookie?</h2>
                    <p>I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando visiti un sito web. Consentono al sito di ricordare le tue azioni e preferenze per un periodo di tempo.</p>

                    <h2>2. Tipi di cookie utilizzati</h2>
                    <ul>
                        <li><strong>Cookie tecnici:</strong> Necessari per il funzionamento del sito e per l'utilizzo delle sue funzionalità, ad esempio per l'invio dei moduli di contatto (richiesta gratuita o messaggio).</li>
                        <li><strong>Cookie analitici:</strong> Utilizzati per raccogliere informazioni anonime sull'utilizzo del sito e migliorarne le prestazioni.</li>
                        <li><strong>Cookie di preferenza:</strong> Utilizzati per memorizzare le scelte dell'utente, come la lingua o il consenso ai cookie.</li>
                    </ul>

                    <h2>3. Cookie di terze parti</h2>
                    <p>Il sito utilizza i seguenti servizi esterni che possono impostare cookie nel tuo browser:</p>
                    <ul>
                        <li><strong>Google Tag Manager:</strong> Permette la gestione di script e tag di terze parti in modo efficiente.</li>
                        <li><strong>Google Analytics:</strong> Raccoglie dati aggregati e anonimi sull'uso del sito per analisi statistiche e miglioramenti.</li>
                    </ul>

                    <h2>4. Gestione dei cookie</h2>
                    <p>Puoi gestire le tue preferenze sui cookie direttamente tramite le impostazioni del browser, scegliendo di accettarli, bloccarli o ricevere un avviso prima dell'installazione. Disattivare i cookie tecnici potrebbe compromettere alcune funzionalità del sito.</p>

                    <h2>5. Consenso</h2>
                    <p>Al primo accesso viene mostrato un banner per la gestione del consenso. Puoi modificarlo in qualsiasi momento cliccando sul link dedicato nel footer del sito.</p>

                    <h2>6. Modifiche alla Cookie Policy</h2>
                    <p>Ci riserviamo il diritto di aggiornare questa Cookie Policy. Eventuali modifiche saranno pubblicate su questa pagina con la data di revisione aggiornata.</p>
                </div>
            </div>
            <Footer />
        </>
    )
}
