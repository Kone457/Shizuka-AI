import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    const user = m.mentionedJid?.[0] || m.quoted?.sender
    if (!user) return m.reply('Etiqueta a alguien, mi rey 👀')

    const frases = [
        'me niego rotundamente a advertir a',
        'no pienso hacerle nada a',
        'me resisto completamente a advertir a',
        'no quiero advertir a',
        'no puedo advertir a',
        'no me da la gana advertir a',
        'hoy no advierto a',
        'no estoy autorizado para advertir a'
    ]

    const frase = frases[Math.floor(Math.random() * frases.length)]

    const texto = `
╭─ׅ─ׅ┈ ─๋︩︪─⚠️─๋︩︪─┈─ׅ─ׅ╮
├ׁ̟̇❍✎ ${frase} @${user.split('@')[0]}
├ׁ̟̇❍✎ 😤 ¡Yo no hago bullying!
╰─ׅ─ׅ┈ ─๋︩︪─⚠️─๋︩︪─┈─ׅ─ׅ╯`.trim()

    await conn.sendMessage(m.chat, { 
        text: texto, 
        mentions: [user] 
    }, { quoted: m })
}

handler.help = ['warn']
handler.tags = ['group']
handler.command = ['warn']

export default handler