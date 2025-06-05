import { NextResponse } from 'next/server'
import { ServerClient } from 'postmark'

const client = new ServerClient(process.env.POSTMARK_API_KEY || '')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, date, time } = body

    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const result = await client.sendEmail({
      From: 'antonio@bortolin.at',
      To: 'antonio@bortolin.at',
      Subject: 'Nuova richiesta di consulenza',
      HtmlBody: `
        <h1>Nuova richiesta</h1>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Data:</strong> ${date}</p>
        <p><strong>Orario:</strong> ${time}</p>
      `,
      TextBody: `
        Nuova richiesta:

        Nome: ${name}
        Email: ${email}
        Data: ${date}
        Orario: ${time}
      `,
      MessageStream: 'outbound'
    })

    return NextResponse.json({ success: true, messageId: result.MessageID })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Errore durante l\'invio del messaggio.' }, { status: 500 })
  }
}
