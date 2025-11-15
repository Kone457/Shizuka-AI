let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `> Ejemplo de uso:\n.react https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v 🥺`,
        m
      )
    }

    // Separar URL y emoji
    const [url, emoji] = text.split(/\s+/)
    if (!url || !emoji) {
      return conn.reply(m.chat, '🌱 Ingresa un link válido y un emoji.', m)
    }

    // Extraer ID del canal
    const match = url.match(/channel\/([0-9A-Za-z]+)/i)
    if (!match) return conn.reply(m.chat, '❌ Enlace inválido.', m)

    const channelId = match[1]

    // Obtener metadata del canal
    const info = await conn.newsletterMetadata('invite', channelId)
    const jid = info.id // JID real del canal, ej: 120363400241973967@newsletter

    // Obtener últimos mensajes del canal
    const msgs = await conn.fetchNewsletterMessages(jid, { limit: 1 })
    if (!msgs || msgs.length === 0) {
      return conn.reply(m.chat, '❌ No se encontraron mensajes en el canal.', m)
    }

    const lastMsg = msgs[0]

    // Reaccionar al último mensaje
    await conn.sendMessage(jid, { react: { text: emoji, key: lastMsg.key } })

    await m.reply(`☑️ Reaccioné con ${emoji} al último mensaje del canal.`)
  } catch (error) {
    console.error(error)
    await conn.reply(
      m.chat,
      `❌ Error al reaccionar:\n> ${error.message}`,
      m
    )
  }
}

handler.command = ['react']
handler.help = ['react <url> <emoji>']
handler.tags = ['tools']
handler.owner = true

export default handler