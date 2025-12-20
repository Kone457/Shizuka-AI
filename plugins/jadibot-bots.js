import ws from 'ws'

let handler = async (m, { conn }) => {
  if (!global.conns || !Array.isArray(global.conns)) {
    global.conns = []
  }

  let uniqueUsers = new Map()
  global.conns.forEach((sock) => {
    if (sock.user && sock.ws?.socket?.readyState !== ws.CLOSED) {
      uniqueUsers.set(sock.user.jid, sock)
    }
  })

  let totalUsers = uniqueUsers.size
  let message = `❒⸺【 *SUB-BOTS ACTIVOS* 】⸺❒\n\n`

  if (totalUsers === 0) {
    message += `> *No hay Sub-Bots conectados en este momento.*`
  } else {
    let i = 1
    uniqueUsers.forEach((sock) => {
      let user = sock.user.jid.split('@')[0]
      let name = sock.user.name || 'Sin nombre'
      let uptime = '0s'
      
      if (sock.uptime) {
        let now = Date.now()
        let ms = now - sock.uptime
        let seconds = Math.floor((ms / 1000) % 60)
        let minutes = Math.floor((ms / (1000 * 60)) % 60)
        let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
        let days = Math.floor(ms / (1000 * 60 * 60 * 24))
        let uptimeParts = []
        if (days > 0) uptimeParts.push(`${days}d`)
        if (hours > 0) uptimeParts.push(`${hours}h`)
        if (minutes > 0) uptimeParts.push(`${minutes}m`)
        if (seconds > 0) uptimeParts.push(`${seconds}s`)
        uptime = uptimeParts.join(' ')
      }

      message += `*${i}.* @${user}\n`
      message += `│  ✩ *Nombre:* ${name}\n`
      message += `│  ✩ *Tiempo activo:* ${uptime}\n`
      message += `│  ✩ *Enlace:* wa.me/${user}\n`
      message += `╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n\n`
      i++
    })
  }

  message += `> *Total de Sub-Bots:* ${totalUsers}`

  await conn.reply(m.chat, message.trim(), m, {
    mentions: Array.from(uniqueUsers.keys())
  })
}

handler.command = ['bots', 'listbots']
handler.help = ['bots']
handler.tags = ['serbot']
export default handler
