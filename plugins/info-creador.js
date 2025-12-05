import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  const mensaje = `
👥 *Equipo de รɧıʑนʞศ*

🌟 *Gracias por usar la bot* 🌟
  `.trim()

  const interactive = proto.Message.InteractiveMessage.fromObject({
    body: proto.Message.InteractiveMessage.Body.create({ text: mensaje }),
    footer: proto.Message.InteractiveMessage.Footer.create({ text: 'Pulsa un botón para abrir el enlace' }),
    header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true }),
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
      buttons: [
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '📲 Carlos',
            url: 'https://wa.me/5355699866',
            merchant_url: 'https://wa.me/5355699866'
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '📲 David',
            url: 'https://wa.me/595975677765',
            merchant_url: 'https://wa.me/595975677765'
          })
        }
      ]
    })
  })

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: interactive
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['team', 'creador', 'owner']

export default handler