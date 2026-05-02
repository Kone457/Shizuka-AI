import ws from 'ws'
import moment from 'moment-timezone'

const BANNER_URL = `${banner}`

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🕯️', key: m.key } })

    let uniqueUsers = new Map()
    let subbotsInfo = []

    if (!global.conns || !Array.isArray(global.conns)) {
      global.conns = []
    }

    global.conns.forEach((connBot) => {
      if (connBot.user && connBot.ws?.socket) {

        
        if (!connBot.connectionTime) {
          connBot.connectionTime = Date.now()
        }

        uniqueUsers.set(connBot.user.jid, {
          bot: connBot,
          connectionTime: connBot.connectionTime
        })
      }
    })

    let totalUsers = uniqueUsers.size

    for (let [jid, data] of uniqueUsers) {
      const connBot = data.bot
      const connectionTime = data.connectionTime

      const uptimeMs = Date.now() - connectionTime
      const tiempoActivo = formatTime(uptimeMs)

      const username = connBot.user?.name || connBot.user?.notify || 'Sin nombre'
      const number = jid.split('@')[0]

      const connectionState = connBot.ws?.socket?.readyState
      let estado = '❓ Desconocido'

      switch(connectionState) {
        case ws.OPEN: estado = '🟢 Conectado'; break
        case ws.CONNECTING: estado = '🟡 Conectando...'; break
        case ws.CLOSING: estado = '🟠 Cerrando...'; break
        case ws.CLOSED: estado = '🔴 Desconectado'; break
      }

      let platform = 'Chrome'

      subbotsInfo.push({
        username,
        number,
        estado,
        tiempoActivo,
        uptimeMs,
        platform,
        connectionTime: moment(connectionTime).tz('America/Havana').format('DD/MM/YY hh:mm:ss A')
      })
    }

    subbotsInfo.sort((a, b) => b.uptimeMs - a.uptimeMs)

    let txt = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🌐 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 𝐀𝐂𝐓𝐈𝐕𝐎𝐒 🌐╮
┃֪࣪
├ׁ̟̇❍✎ Total: ${totalUsers}
├ׁ̟̇❍✎ Fecha: ${moment().tz('America/Havana').format('DD/MM/YYYY')}
├ׁ̟̇❍✎ Hora: ${moment().tz('America/Havana').format('hh:mm A')}
├ׁ̟̇❍✎ Bot: ${conn.user.name || 'Principal'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

    if (subbotsInfo.length === 0) {
      txt += `

╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚠️ 𝐒𝐈𝐍 𝐒𝐔𝐁𝐁𝐎𝐓𝐒 ⚠️╮
┃֪࣪
├ׁ̟̇❍✎ No hay subbots activos
├ׁ̟̇❍✎ Usa .qr o .code
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`
    } else {
      subbotsInfo.forEach((subbot, index) => {
        txt += `

╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🤖 𝐒𝐔𝐁-𝐁𝐎𝐓 ${index + 1} 🤖╮
┃֪࣪
├ׁ̟̇❍✎ Nombre: ${subbot.username}
├ׁ̟̇❍✎ Número: ${subbot.number}
├ׁ̟̇❍✎ Estado: ${subbot.estado}
├ׁ̟̇❍✎ Tiempo: ${subbot.tiempoActivo}
├ׁ̟̇❍✎ Desde: ${subbot.connectionTime}
├ׁ̟̇❍✎ Plataforma: ${subbot.platform}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`
      })
    }

    const metaMsg = {
      contextInfo: {
        externalAdReply: {
          title: '❖ SUB-BOTS ACTIVOS ❖',
          body: `${totalUsers} conectados`,
          thumbnailUrl: BANNER_URL,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    await conn.sendMessage(m.chat, {
      text: txt.trim(),
      ...metaMsg
    }, { quoted: m })

  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐄𝐑𝐑𝐎𝐑 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
    }, { quoted: m })
  }
}

function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000)

  let h = Math.floor(totalSeconds / 3600)
  let m = Math.floor((totalSeconds % 3600) / 60)
  let s = totalSeconds % 60

  return [
    h ? `${h}h` : '',
    m ? `${m}m` : '',
    `${s}s`
  ].filter(Boolean).join(' ')
}

handler.command = ['bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler