const handler = async (m, { conn, usedPrefix, command }) => {
  const mentioned = m.mentionedJid
  if (!mentioned.length) {
    return conn.reply(m.chat, `💩 Menciona a *una persona* para generar su imagen de mierda.\nEjemplo: ${usedPrefix + command} @usuario`, m)
  }

  const user = mentioned[0]
  const profile = await conn.profilePictureUrl(user, 'image').catch(_ => 'https://i.imgur.com/placeholder.jpg')

  const api = `https://delirius-apiofc.vercel.app/canvas/shit?url=${encodeURIComponent(profile)}`

  await conn.sendMessage(m.chat, {
    image: { url: api },
    caption: `🧻 La mierda a llegado`,
    footer: '✨ Imagen generada',
    contextInfo: {
      externalAdReply: {
        title: 'Visualización emocional',
        body: 'Aura directa y teatral',
        thumbnailUrl: api,
        sourceUrl: api
      }
    }
  }, { quoted: m })
}

handler.command = ['mierda', 'ritualdrama']
handler.help = ['mierda @usuario']
handler.tags = ['fun']
handler.register = true
handler.group = true
handler.premium = false

export default handler