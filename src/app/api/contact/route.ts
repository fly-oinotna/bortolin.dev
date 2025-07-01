import { NextResponse } from 'next/server'
import { ServerClient } from 'postmark'

const client = new ServerClient(process.env.POSTMARK_API_KEY || '')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const result = await client.sendEmail({
      From: 'antonio@bortolin.dev',
      To: 'antonio@bortolin.dev',
      Subject: 'Nuova richiesta di consulenza',
      HtmlBody: `
        <h1>Nuova richiesta</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Messaggio:</strong> ${message}</p>
      `,
      TextBody: `
        Nuova richiesta:

        Nome: ${name}
        Email: ${email}
        Messaggio: ${message}
      `,
      MessageStream: 'outbound'
    })

    return NextResponse.json({ success: true, messageId: result.MessageID })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Errore durante l\'invio del messaggio.' }, { status: 500 })
  }
}
