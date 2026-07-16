import ws from 'ws'
import { getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn }) => {
  const BANNER_URL = getBotConfig(conn, 'banner')
  try {
    await conn.sendMessage(m.chat, { react: { text: '🕯️', key: m.key } })

    let uniqueUsers = new Map()
    if (!global.conns || !Array.isArray(global.conns)) {
      global.conns = []
    }

    global.conns.forEach((connBot) => {
      if (connBot.user && connBot.ws?.socket && connBot.ws.socket.readyState !== ws.CLOSED) {
        uniqueUsers.set(connBot.user.jid, connBot)
      }
    })

    let totalUsersGlobal = uniqueUsers.size
    let subbotsInfo = []
    for (let [jid] of uniqueUsers) {
      const numberRaw = jid.split('@')[0]
      const number = `@${numberRaw}`
      subbotsInfo.push({ number })
    }

    let txt = `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
🌐 SUB-BOTS EN ESTE GRUPO 🌐
Subs › *${subbotsInfo.length}*
Total activos › *${totalUsersGlobal}*
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n`

    if (subbotsInfo.length === 0) {
      txt += `\n⚠️ No hay subbots activos\nUsa .qr o .code`
    } else {
      subbotsInfo.forEach((subbot, i) => {
        txt += `\n${i + 1}) ${subbot.number}`
      })
    }

    await conn.sendMessage(m.chat, {
      image: { url: BANNER_URL },
      caption: txt.trim(),
      mentions: subbotsInfo.map(s => s.number.replace('@', '') + '@s.whatsapp.net')
    }, { quoted: m })

  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐄𝐑𝐑𝐎𝐑 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim()
    }, { quoted: m })
  }
}

handler.command = ['bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler