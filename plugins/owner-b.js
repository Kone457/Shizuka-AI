import ws from 'ws'

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('✿ *Escribe algo*')

  const text = args.join(' ')
  let enviados = [], fallidos = []

  try {
    await conn.sendMessage(conn.user.jid, { text })
    enviados.push(conn.user?.id || 'Bot principal')
  } catch {
    fallidos.push(conn.user?.id || 'Bot principal')
  }

  if (global.conns && Array.isArray(global.conns)) {
    for (const sub of global.conns) {
      if (!sub?.ws?.socket || sub.ws.socket.readyState === ws.CLOSED) continue
      try {
        await sub.sendMessage(sub.user.jid, { text })
        enviados.push(sub.user?.id)
      } catch {
        fallidos.push(sub.user?.id)
      }
    }
  }

  let txt = `\n✅ Enviados: ${enviados.length}\n❌ Fallidos: ${fallidos.length}`
  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.tags = ['serbot']
handler.command = ['sbc']

export default handler