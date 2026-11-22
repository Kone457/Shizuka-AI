import ws from 'ws'

let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`مثال:\n.${command} https://whatsapp.com/channel/XXXX/123 😘`)
  }

  const args = text.trim().split(/\s+/)
  const link = args.shift()

  if (!link.startsWith('https://whatsapp.com/channel/')) {
    return m.reply('❌ لازم تبعت لينك قناة صحيح.')
  }

  const parts = link.split('/')
  if (parts.length < 6) return m.reply('❌ لينك القناة غير صحيح.')

  const channelId = parts[4]
  const messageId = parts[5]
  const emoji = args.join(' ')
  if (!emoji) return m.reply('❌ لازم تحط إيموجي.')

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


handler.help = ['تفاعل']
handler.tags = ['owner']
handler.command = ['react', 'تفاعل']
handler.owner = true

export default handler