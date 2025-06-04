import type { Metadata } from "next"

import Footer from '@/components/Footer'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: "🔒 Privacy Policy",
  robots: 'noindex, nofollow'
}

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className='container'>
        <div className='content'>
          <h1 className='mb-10'>Informativa sulla privacy</h1>
          <p><strong>Ultimo aggiornamento:</strong> 3 giugno 2025</p>

          <p>Il titolare del trattamento dei dati è:</p>
          <p>
            <strong>Antonio Bortolin</strong><br />
            Email: <a href="mailto:antonio@bortolin.dev">antonio@bortolin.dev</a><br />
            Partita IVA: IT05504860262
          </p>

          <h2>Dati raccolti</h2>
          <p>Durante l'utilizzo del sito, possono essere raccolti i seguenti dati personali:</p>
          <ul>
            <li><strong>Dati forniti volontariamente:</strong> nome, email e altri dati inseriti nei moduli di contatto.</li>
            <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, dispositivo, sistema operativo, pagine visitate e durata della visita.</li>
            <li><strong>Cookie:</strong> file utilizzati per migliorare l’esperienza di navigazione. Per dettagli, consulta la <a href="https://bortolin.dev/informativa-sulla-gestione-dei-cookie">Cookie Policy</a>.</li>
          </ul>

          <h2>Finalità e base giuridica</h2>
          <p>I dati sono trattati per:</p>
          <ol>
            <li>Rispondere alle richieste ricevute via modulo o email.</li>
            <li>Analizzare l’uso del sito e migliorarne il funzionamento.</li>
            <li>Assolvere a obblighi legali o fiscali.</li>
          </ol>
          <p>Il trattamento si basa sul consenso dell’interessato, sull’esecuzione di un contratto o su obblighi di legge.</p>

          <h2>Destinatari dei dati</h2>
          <p>I dati non saranno mai venduti. Potrebbero essere comunicati a:</p>
          <ul>
            <li><strong>Fornitori di servizi tecnici</strong> (es. hosting, analisi web).</li>
            <li><strong>Autorità competenti</strong>, su richiesta o per obbligo di legge.</li>
          </ul>

          <h2>Conservazione</h2>
          <p>I dati personali saranno conservati per il tempo necessario alle finalità indicate o per obblighi normativi.</p>

          <h2>Diritti dell’utente</h2>
          <p>In ogni momento puoi esercitare i diritti previsti dal GDPR, tra cui:</p>
          <ul>
            <li>Diritto di accesso, rettifica, cancellazione dei dati.</li>
            <li>Limitazione e opposizione al trattamento.</li>
            <li>Portabilità dei dati.</li>
            <li>Revoca del consenso precedentemente prestato.</li>
            <li>Reclamo all’autorità di controllo competente.</li>
          </ul>

          <p>Per esercitare i tuoi diritti, scrivimi a: <a href="mailto:antonio@bortolin.dev">antonio@bortolin.dev</a></p>
        </div>
      </div>
      <Footer />
    </>
  )
}
