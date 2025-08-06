/*───────────────────────────────────────
  📁 Módulo:     reto.js
  🧠 Autor:      Carlos
  🛠 Proyecto:   Shizuka-AI
  🔗 GitHub:     https://github.com/Kone457/Shizuka-AI
───────────────────────────────────────*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  let who = m.mentionedJid.length > 0
    ? m.mentionedJid[0]
    : (m.quoted ? m.quoted.sender : m.sender)

  let name = await conn.getName(who)
  let name2 = await conn.getName(m.sender)

  const retos = [
    'Baila como si nadie te estuviera mirando durante 1 minuto.',
    'Imita a tu personaje de película favorito.',
    'Envía un mensaje de texto a la persona que menos te gusta.',
    'Haz una llamada a un amigo y dile que lo amas.',
    'Come una cucharada de mostaza.',
    'Haz 10 flexiones.',
    'Canta una canción en voz alta.',
    'Haz una imitación de un animal.',
    'Deja que alguien te pinte la cara.',
    'Haz una pose ridícula y manténla durante 30 segundos.',
    'Habla con acento durante 5 minutos.',
    'Publica una foto vergonzosa en tus redes sociales.',
    'Haz un truco de magia.',
    'Baila con una escoba como si fuera tu pareja.',
    'Llama a un amigo y dile que has ganado la lotería.',
    'Haz una declaración de amor a alguien en el grupo.',
    'Come un trozo de fruta con los ojos vendados.',
    'Haz una lista de tus 5 peores hábitos.',
    'Deja que alguien te haga un peinado loco.',
    'Haz una serenata a alguien en el grupo.',
  ]

  let reto = retos[Math.floor(Math.random() * retos.length)]

  let str =
    who === m.sender
      ? `╭──〔 🎭 YO TE RETO 〕──╮\n` +
        `┃ ${name2}, tu reto es:\n┃ ${reto}\n` +
        `╰─────────────────────────╯`
      : `╭──〔 🤝 RETO ENTREGADO 〕──╮\n` +
        `┃ A ${name}, tu reto es:\n┃ ${reto}\n` +
        `╰────────────────────────╯`

  if (m.isGroup) {
    await conn.sendMessage(
      m.chat,
      {
        text: str,
        mentions: [who]
      },
      { quoted: m }
    )
  }
}

handler.help = ['reto']
handler.tags = ['fun']
handler.command = ['reto']
handler.group = true

export default handler
