import ws from 'ws'
import { getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn }) => {
  const BANNER_URL = getBotConfig(conn, 'banner')

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🕯️',
        key: m.key
      }
    })

    if (!global.conns || !Array.isArray(global.conns)) {
      global.conns = []
    }

    const metadata = await conn.groupMetadata(m.chat)
    const participants = metadata.participants || []

    const uniqueUsers = new Map()

    for (const connBot of global.conns) {
      if (
        !connBot.user ||
        !connBot.ws?.socket ||
        connBot.ws.socket.readyState === ws.CLOSED
      ) continue

      const isInGroup = participants.some(
        p => p.id === connBot.user.jid
      )

      if (!isInGroup) continue

      uniqueUsers.set(connBot.user.jid, connBot)
    }

    const subbotsInfo = []

    for (const [jid] of uniqueUsers) {
      const number = `@${jid.split('@')[0]}`
      subbotsInfo.push({ number })
    }

    let txt = `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
🌐 SUB-BOTS EN ESTE GRUPO 🌐
Subs › *${subbotsInfo.length}*
Total activos › *${subbotsInfo.length}*
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n`

    if (!subbotsInfo.length) {
      txt += `\n⚠️ No hay subbots activos en este grupo.\nUsa .qr o .code`
    } else {
      subbotsInfo.forEach((subbot, i) => {
        txt += `\n${i + 1}) ${subbot.number}`
      })
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: BANNER_URL },
        caption: txt.trim(),
        mentions: subbotsInfo.map(
          s => s.number.replace('@', '') + '@s.whatsapp.net'
        )
      },
      { quoted: m }
    )

  } catch (e) {
    await conn.sendMessage(
      m.chat,
      {
        text: `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐄𝐑𝐑𝐎𝐑 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`
      },
      { quoted: m }
    )
  }
}

handler.command = ['bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler