import ws from 'ws'

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('✿ Ingresa el enlace del grupo.\nEjemplo: *.sjoin https://chat.whatsapp.com/XXXXXXX*')

  const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]+)/i
  const match = args[0].match(linkRegex)
  if (!match) return m.reply('✿ Enlace inválido.')

  const inviteCode = match[1]
  let joined = []
  let failed = []

  try {
    await conn.groupAcceptInvite(inviteCode)
    joined.push(conn.user?.id || 'Bot')
  } catch (e) {
    failed.push(conn.user?.id || 'Bot')
  }

  if (global.conns && Array.isArray(global.conns)) {
    for (const sub of global.conns) {
      if (!sub?.ws?.socket || sub.ws.socket.readyState === ws.CLOSED) continue
      try {
        await sub.groupAcceptInvite(inviteCode)
        joined.push(sub.user?.id)
      } catch (e) {
        failed.push(sub.user?.id)
      }
    }
  }

  let txt = `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
🌐 RESULTADO 🌐
Unidos correctamente: *${joined.length}*
Fallidos: *${failed.length}*
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`

  if (joined.length) txt += `\n✅ ${joined.join('\n✅ ')}`
  if (failed.length) txt += `\n❌ ${failed.join('\n❌ ')}`

  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.tags = ['serbot']
handler.command = ['sjoin']

export default handler