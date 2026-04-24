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
      if (connBot.user && connBot.ws?.socket?.readyState !== ws.CLOSED) {
        uniqueUsers.set(connBot.user.jid, {
          bot: connBot,
          connectionTime: connBot.connectionTime || Date.now()
        })
      }
    })

    let totalUsers = uniqueUsers.size

    for (let [jid, data] of uniqueUsers) {
      const connBot = data.bot
      const connectionTime = data.connectionTime

      const uptime = Date.now() - connectionTime
      const hours = Math.floor(uptime / (1000 * 60 * 60))
      const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((uptime % (1000 * 60)) / 1000)

      let tiempoActivo = ''
      if (hours > 0) tiempoActivo += `${hours}h `
      if (minutes > 0) tiempoActivo += `${minutes}m `
      if (seconds > 0 || tiempoActivo === '') tiempoActivo += `${seconds}s`

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

      const platform = connBot.user?.platform || connBot.user?.device || 'Desconocido'

      subbotsInfo.push({
        username,
        number,
        estado,
        tiempoActivo,
        platform,
        connectionTime: moment(connectionTime).tz('America/Havana').format('DD/MM/YY hh:mm:ss A')
      })
    }

    subbotsInfo.sort((a, b) => b.connectionTime.localeCompare(a.connectionTime))

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

      txt += `

    ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📊 𝐑𝐄𝐒𝐔𝐌𝐄𝐍 📊╮
┃֪࣪
├ׁ̟̇❍✎ Total: ${totalUsers}
├ׁ̟̇❍✎ Conectados: ${subbotsInfo.filter(s => s.estado.includes('🟢')).length}
├ׁ̟̇❍✎ Promedio: ${calculateAverageTime(subbotsInfo)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`
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

function calculateAverageTime(subbotsInfo) {
  if (subbotsInfo.length === 0) return '0s'

  const totalSeconds = subbotsInfo.reduce((acc, subbot) => {
    let t = subbot.tiempoActivo
    let s = 0

    if (t.includes('h')) s += parseInt(t.match(/(\d+)h/)?.[1] || 0) * 3600
    if (t.includes('m')) s += parseInt(t.match(/(\d+)m/)?.[1] || 0) * 60
    if (t.includes('s')) s += parseInt(t.match(/(\d+)s/)?.[1] || 0)

    return acc + s
  }, 0)

  let avg = Math.floor(totalSeconds / subbotsInfo.length)

  let h = Math.floor(avg / 3600)
  let m = Math.floor((avg % 3600) / 60)
  let s = avg % 60

  return `${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s ? s + 's' : ''}`.trim()
}

handler.command = ['bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler