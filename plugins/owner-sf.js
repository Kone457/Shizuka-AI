import ws from 'ws'

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('✿ Ingresa el link del canal.')

  const linkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i
  const match = args[0].match(linkRegex)
  if (!match) return m.reply('✿ Link inválido.')

  const channelId = match[1]
  let joined = [], failed = []

  try {
    await conn.newsletterFollow(`${channelId}@newsletter`)
    joined.push(conn.user?.id || 'Bot principal')
  } catch {
    failed.push(conn.user?.id || 'Bot principal')
  }

  if (global.conns && Array.isArray(global.conns)) {
    for (const sub of global.conns) {
      if (!sub?.ws?.socket || sub.ws.socket.readyState === ws.CLOSED) continue
      try {
        await sub.newsletterFollow(`${channelId}@newsletter`)
        joined.push(sub.user?.id)
      } catch {
        failed.push(sub.user?.id)
      }
    }
  }

  let txt = `🌐 RESULTADO\n✅ Unidos: ${joined.length}\n❌ Fallidos: ${failed.length}`
  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.tags = ['serbot']
handler.command = ['sf']

export default handler