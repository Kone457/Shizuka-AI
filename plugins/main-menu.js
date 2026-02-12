import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

const BANNER_URL = 'https://files.catbox.moe/4k9pie.jpg'

export default {
  command: ['menu', 'help'],
  category: 'info',

  run: async (client, m) => {
    try {

      const res = await fetch(BANNER_URL)
      const buffer = Buffer.from(await res.arrayBuffer())

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.create({

                header: proto.Message.InteractiveMessage.Header.create({
                  title: '🕷️ MENÚ PRINCIPAL',
                  hasMediaAttachment: true,
                  imageMessage: {
                    mimetype: 'image/jpeg',
                    jpegThumbnail: buffer
                  }
                }),

                body: proto.Message.InteractiveMessage.Body.create({
                  text: 'Selecciona una opción del menú'
                }),

                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: 'Bot • by Carlos'
                }),

                nativeFlowMessage:
                  proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                      {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                          display_text: '📂 Categorías',
                          id: 'menu categorias'
                        })
                      },
                      {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                          display_text: '👑 Owner',
                          id: 'owner'
                        })
                      }
                    ]
                  })

              })
            }
          }
        },
        { quoted: m }
      )

      await client.relayMessage(m.chat, msg.message, {
        messageId: msg.key.id
      })

    } catch (e) {
      console.error(e)
      await m.reply('*Error en el menú:* ' + e.message)
    }
  }
}