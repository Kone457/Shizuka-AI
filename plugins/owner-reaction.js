let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`Ejemplo:\n.${command} https://whatsapp.com/channel/XXXX/123 😘`)
  }

  const args = text.trim().split(/\s+/)
  const link = args.shift()

  if (!link.startsWith('https://whatsapp.com/channel/')) {
    return m.reply('❌ Debes enviar un enlace válido del canal.')
  }

  const parts = link.split('/')
  if (parts.length < 6) return m.reply('❌ El enlace del canal no es válido.')

  const channelId = parts[4]
  const messageId = parts[5]
  const emoji = args.join(' ')

  if (!emoji) return m.reply('❌ Debes poner un emoji.')

  try {
    const channel = await conn.newsletterMetadata('invite', channelId)
    await conn.newsletterReactMessage(channel.id, messageId, emoji)

    m.reply(`✅ Reacción enviada correctamente.\n\n📢 Canal: ${channel.name}\n🎭 Emoji: ${emoji}`)
  } catch (e) {
    console.error(e)
    m.reply(`❌ No se pudo enviar la reacción.\n\n${e.message || e}`)
  }
}

handler.tags = ['tools']
handler.command = ['react']
handler.owner = true

export default handler