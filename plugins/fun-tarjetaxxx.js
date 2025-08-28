const handler = async (m, { conn, usedPrefix, command }) => {
  const mentioned = m.mentionedJid
  const text = m.text.split(' ').slice(1).join(' ')
  if (!mentioned.length || !text) {
    return conn.reply(m.chat, `🌸 Menciona a *una persona* y agrega una descripción emocional.\nEjemplo: ${usedPrefix + command} @usuario Bienvenido a Delirius API 😈`, m)
  }

  const user = mentioned[0]
  const image = await conn.profilePictureUrl(user, 'image').catch(_ => 'https://i.imgur.com/placeholder.jpg')

  const api = `https://delirius-apiofc.vercel.app/canvas/xnxxcard?image=${encodeURIComponent(image)}&title=${encodeURIComponent(text)}`

  await conn.sendMessage(m.chat, {
    image: { url: api },
    caption: `📝 *${text}*`,
    footer: '✨ Imagen ritual sin etiquetas añadidas',
    contextInfo: {
      externalAdReply: {
        title: 'Aura personalizada',
        body: 'Visualización emocional sin interferencias',
        thumbnailUrl: api,
        sourceUrl: api
      }
    }
  }, { quoted: m })
}

handler.command = ['tarjeta', 'perfilcard']
handler.help = ['tarjeta @usuario descripción']
handler.tags = ['fun']
handler.register = true
handler.group = true
handler.premium = false

export default handler