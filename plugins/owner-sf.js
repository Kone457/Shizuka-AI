import ws from 'ws'

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) return m.reply('❌ المطور بس اللي يقدر يستخدم الأمر ده.')
  if (!args[0]) return m.reply('Que haces?')

  const linkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i
  const match = args[0].match(linkRegex)
  if (!match) return m.reply('❌ لينك غير صحيح.')

  const channelId = match[1]
  let success = 0, fail = 0

  const followChannel = async (c) => {
    try {
      await c.newsletterFollow(`${channelId}@newsletter`)
      success++
    } catch {
      fail++
    }
  }

  await followChannel(conn)

  if (global.conns && Array.isArray(global.conns)) {
    for (const sub of global.conns) {
      if (!sub?.ws?.socket || sub.ws.socket.readyState === ws.CLOSED) continue
      await followChannel(sub)
    }
  }

  await conn.sendMessage(
    m.chat,
    { text: `✅ بوتات انضمت: ${success}\n❌ أخطاء: ${fail}` },
    { quoted: m }
  )
}

handler.tags = ['owner']
handler.command = ['sf']
handler.owner = true

export default handler