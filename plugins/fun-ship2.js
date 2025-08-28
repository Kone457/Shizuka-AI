const handler = async (m, { conn, usedPrefix, command }) => {
  const mentioned = m.mentionedJid
  if (mentioned.length < 2) {
    return conn.reply(m.chat, `💞 Menciona a *dos personas* para generar el ritual de vínculo.\nEjemplo: ${usedPrefix + command} @usuario1 @usuario2`, m)
  }

  const [user1, user2] = mentioned

  const name1 = await conn.getName(user1)
  const name2 = await conn.getName(user2)

  const image1 = await conn.profilePictureUrl(user1, 'image').catch(_ => 'https://i.imgur.com/placeholder1.jpg')
  const image2 = await conn.profilePictureUrl(user2, 'image').catch(_ => 'https://i.imgur.com/placeholder2.jpg')

  const percentage = Math.floor(Math.random() * 100) + 1
  const message = 'Vínculo emocional detectado 💘'

  const api = `https://delirius-apiofc.vercel.app/canvas/ship?image1=${encodeURIComponent(image1)}&name1=${encodeURIComponent(name1)}&image2=${encodeURIComponent(image2)}&name2=${encodeURIComponent(name2)}&percentage=${percentage}&text=${encodeURIComponent(message)}`

  await conn.sendMessage(m.chat, {
    image: { url: api },
    caption: `💖 *${name1}* + *${name2}*\n🔗 Compatibilidad: *${percentage}%*\n💌 Mensaje: ${message}`,
    footer: '🌹 Ritual de vínculo generado',
    contextInfo: {
      externalAdReply: {
        title: 'Aura de conexión',
        body: 'Complicidad emocional visualizada',
        thumbnailUrl: api,
        sourceUrl: api
      }
    }
  }, { quoted: m })
}

handler.command = ['ship2', 'vinculo']
handler.help = ['ship2 @usuario1 @usuario2']
handler.tags = ['rituales', 'canvas']
handler.register = true
handler.group = true
handler.premium = false

export default handler