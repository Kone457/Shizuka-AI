import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

const BANNER_URL = 'https://files.catbox.moe/4k9pie.jpg'

export default {
  command: ['menu'],
  category: 'system',
  run: async (client, m) => {

    try {

      const res = await fetch(BANNER_URL)
      const buffer = Buffer.from(await res.arrayBuffer())

      const media = await prepareWAMessageMedia(
        {
          image: buffer,
          mimetype: 'image/jpeg'
        },
        { upload: client.waUploadToServer }
      )

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.create({
                header: proto.Message.InteractiveMessage.Header.create({
                  hasMediaAttachment: true,
                  imageMessage: media.imageMessage
                }),
                body: proto.Message.InteractiveMessage.Body.create({
                  text: '🕷️ Menú principal'
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: 'Selecciona una opción'
                }),
                nativeFlowMessage:
                  proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                      {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                          display_text: '🕷️ Menú AI',
                          id: 'menu ai'
                        })
                      },
                      {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                          display_text: '🕷️ Owner',
                          id: 'owner'
                        })
                      },
                      {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                          display_text: '🕷️ Código',
                          id: 'code'
                        })
                      }
                    ]
                  })
              })
            }
          }
        },
        {}
      )

      await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    } catch (e) {
      console.log(e)
      await m.reply('*Error en el menú:* ' + e.message)
    }

  }
}