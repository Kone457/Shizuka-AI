import ws from 'ws'

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

  const sendReaction = async (c) => {
    try {
      const channel = await c.newsletterMetadata('invite', channelId)
      await c.newsletterReactMessage(channel.id, messageId, emoji)
      return true
    } catch {
      return false
    }
  }

  let success = 0, fail = 0

  if (await sendReaction(conn)) success++
  else fail++

  if (global.conns && Array.isArray(global.conns)) {
    for (const sub of global.conns) {
      if (!sub?.ws?.socket || sub.ws.socket.readyState === ws.CLOSED) continue
      if (await sendReaction(sub)) success++
      else fail++
    }
  }

  await conn.sendMessage(
    m.chat,
    { text: `✅ Reacciones enviadas: ${success}\n❌ Errores: ${fail}\n🎭 Emoji usado: ${emoji}` },
    { quoted: m }
  )
}


handler.tags = ['owner']
handler.command = ['react']
handler.owner = true

export default handler