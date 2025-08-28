const handler = async (m, { conn, participants, usedPrefix, command }) => {
  const mentioned = m.mentionedJid
  if (mentioned.length < 2) {
    return conn.reply(m.chat, `🌸 Menciona a *dos personas* para generar el ritual de amistad.\nEjemplo: ${usedPrefix + command} @usuario1 @usuario2`, m)
  }

  const [user1, user2] = mentioned

  const name1 = await conn.getName(user1)
  const name2 = await conn.getName(user2)

  const image1 = await conn.profilePictureUrl(user1, 'image').catch(_ => 'https://i.imgur.com/placeholder1.jpg')
  const image2 = await conn.profilePictureUrl(user2, 'image').catch(_ => 'https://i.imgur.com/placeholder2.jpg')

  const percentage = Math.floor(Math.random() * 100) + 1
  const message = 'Conexión emocional detectada 💞'

  const api = `https://delirius-apiofc.vercel.app/canvas/friendship?image1=${encodeURIComponent(image1)}&name1=${encodeURIComponent(name1)}&image2=${encodeURIComponent(image2)}&name2=${encodeURIComponent(name2)}&percentage=${percentage}&text=${encodeURIComponent(message)}`

  await conn.sendMessage(m.chat, {
    image: { url: api },
    caption: `🤝 *${name1}* & *${name2}*\n💫 Compatibilidad: *${percentage}%*\n💌 Mensaje: ${message}`,
    footer: '✨ Ritual de amistad generado',
    contextInfo: {
      externalAdReply: {
        title: 'Aura de amistad',
        body: 'Conexión emocional visualizada',
        thumbnailUrl: api,
        sourceUrl: api
      }
    }
  }, { quoted: m })
}

handler.command = ['amistad2', 'friendshipauto']
handler.help = ['amistad2 @usuario1 @usuario2']
handler.tags = ['fun']
handler.register = true
handler.group = true
handler.premium = false

export default handler