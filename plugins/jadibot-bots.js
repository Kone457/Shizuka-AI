import ws from 'ws'
import moment from 'moment-timezone'

const BANNER_URL = `${banner}`

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } })

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
        case ws.OPEN:
          estado = '🟢 Conectado'
          break
        case ws.CONNECTING:
          estado = '🟡 Conectando...'
          break
        case ws.CLOSING:
          estado = '🟠 Cerrando...'
          break
        case ws.CLOSED:
          estado = '🔴 Desconectado'
          break
      }
      
      const platform = connBot.user?.platform || connBot.user?.device || 'Una calculadora'
      
      subbotsInfo.push({
        username,
        number,
        jid,
        estado,
        tiempoActivo,
        platform,
        connectionTime: moment(connectionTime).tz('America/Havana').format('DD/MM/YY hh:mm:ss A')
      })
    }

    subbotsInfo.sort((a, b) => b.connectionTime.localeCompare(a.connectionTime))

    let txt = `*✧ INFORMACIÓN DE SUB-BOTS ✧*\n`
    txt += `*Total Activos:* ${totalUsers || 0}\n`
    txt += `*Fecha:* ${moment().tz('America/Havana').format('DD/MM/YYYY hh:mm:ss A')}\n`
    txt += `*Bot Principal:* ${conn.user.name || 'No disponible'}\n`
    txt += `\n${'═'.repeat(20)}\n\n`

    if (subbotsInfo.length === 0) {
      txt += `*No hay subbots activos en este momento.*\n`
      txt += `Usa el comando *.qr* o *.code* para crear uno.`
    } else {
      subbotsInfo.forEach((subbot, index) => {
        txt += `*[ SUB-BOT ${index + 1} ]*\n`
        txt += `▸ *Nombre:* ${subbot.username}\n`
        txt += `▸ *Número:* ${subbot.number}\n`
        txt += `▸ *Estado:* ${subbot.estado}\n`
        txt += `▸ *Tiempo Activo:* ${subbot.tiempoActivo}\n`
        txt += `▸ *Conectado desde:* ${subbot.connectionTime}\n`
        txt += `▸ *Plataforma:* ${subbot.platform}\n`
        
        if (index < subbotsInfo.length - 1) {
          txt += `\n${'─'.repeat(30)}\n\n`
        }
      })
      
      txt += `\n${'═'.repeat(20)}\n`
      txt += `*📊 RESUMEN*\n`
      txt += `• Total Subbots: ${totalUsers}\n`
      txt += `• Conectados: ${subbotsInfo.filter(s => s.estado.includes('🟢')).length}\n`
      txt += `• Tiempo promedio: ${calculateAverageTime(subbotsInfo)}\n`
    }

    const metaMsg = {
      contextInfo: {
        externalAdReply: {
          title: '✧ SUB-BOTS ACTIVOS ✧',
          body: `🌐 ${totalUsers} subbots conectados`,
          thumbnailUrl: BANNER_URL,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: 'https://whatsapp.com',
          mediaUrl: BANNER_URL
        }
      }
    }

    await conn.sendMessage(m.chat, {
      text: txt,
      ...metaMsg
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: `🕸 Error [${e.message || e}]` }, { quoted: m })
  }
}

function calculateAverageTime(subbotsInfo) {
  if (subbotsInfo.length === 0) return '0s'
  
  const totalSeconds = subbotsInfo.reduce((acc, subbot) => {
    const tiempo = subbot.tiempoActivo
    let seconds = 0
    
    if (tiempo.includes('h')) {
      const horas = parseInt(tiempo.match(/(\d+)h/)?.[1] || 0)
      seconds += horas * 3600
    }
    if (tiempo.includes('m')) {
      const minutos = parseInt(tiempo.match(/(\d+)m/)?.[1] || 0)
      seconds += minutos * 60
    }
    if (tiempo.includes('s')) {
      const segundos = parseInt(tiempo.match(/(\d+)s/)?.[1] || 0)
      seconds += segundos
    }
    
    return acc + seconds
  }, 0)
  
  const avgSeconds = Math.floor(totalSeconds / subbotsInfo.length)
  
  const hours = Math.floor(avgSeconds / 3600)
  const minutes = Math.floor((avgSeconds % 3600) / 60)
  const seconds = avgSeconds % 60
  
  let result = ''
  if (hours > 0) result += `${hours}h `
  if (minutes > 0) result += `${minutes}m `
  if (seconds > 0 || result === '') result += `${seconds}s`
  
  return result.trim()
}

handler.command = ['bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler