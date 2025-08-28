const handler = async (m, { conn, usedPrefix, command }) => {
  const mentioned = m.mentionedJid
  if (!mentioned.length) {
    return conn.reply(m.chat, `🌸 Menciona a *una persona* para generar su balcard ceremonial.\nEjemplo: ${usedPrefix + command} @usuario`, m)
  }

  const user = mentioned[0]
  const name = await conn.getName(user)
  const profile = await conn.profilePictureUrl(user, 'image').catch(_ => 'https://i.imgur.com/placeholder.jpg')
  const background = 'https://qu.ax/kmDGj.jpg'

  // Generación aleatoria ritualizada
  const discriminator = Math.floor(Math.random() * 9999999999999)
  const money = Math.floor(Math.random() * 5000) + 100
  const xp = Math.floor(Math.random() * 100000) + 500
  const level = Math.floor(Math.random() * 100) + 1

  const api = `https://delirius-apiofc.vercel.app/canvas/balcard?url=${encodeURIComponent(profile)}&background=${encodeURIComponent(background)}&username=${encodeURIComponent(name)}&discriminator=${discriminator}&money=${money}&xp=${xp}&level=${level}`

  await conn.sendMessage(m.chat, {
    image: { url: api },
    caption: `🎮 *${name}*\n💸 Dinero: ${money}\n📈 XP: ${xp}\n🧭 Nivel: ${level}`,
    footer: '✨ Balcard ritual con aura automática',
    contextInfo: {
      externalAdReply: {
        title: 'Perfil ceremonial',
        body: 'Aura visual con estadísticas emocionales',
        thumbnailUrl: api,
        sourceUrl: api
      }
    }
  }, { quoted: m })
}

handler.command = ['balcard', 'perfilritual']
handler.help = ['balcard @usuario']
handler.tags = ['fun']
handler.register = true
handler.group = true
handler.premium = false

export default handler