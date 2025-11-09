import fetch from 'node-fetch'
import { default as WA, proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('> Ingresa el nombre de una app para buscar en Play Store.')

  try {
    const res = await fetch(`https://api.vreden.my.id/api/v1/search/google/play?query=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !json.result?.search_data?.length) {
      return m.reply('> No se encontraron aplicaciones para tu búsqueda.')
    }

    const cards = []
    const apps = json.result.search_data.slice(0, 10)

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i]
      let headerObj

      try {
        const imgBuffer = await (await fetch(app.img)).buffer()
        const media = await prepareWAMessageMedia({ image: imgBuffer }, { upload: conn.waUploadToServer })
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: true, imageMessage: media.imageMessage })
      } catch {
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
      }

      const bodyText = `📱 ${app.nama}\n👤 ${app.developer}\n⭐ ${app.rate}`
      const footerText = `🔍 Resultado ${i + 1}`

      const card = {
        header: headerObj,
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: bodyText }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: footerText }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '📥 Ver en Play Store',
                url: app.link
              })
            }
          ]
        })
      }

      cards.push(card)
    }

    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ text: `✧ Resultados de Play Store para *${json.result.query}*` }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: `Total: ${json.result.count} apps` }),
      header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
      carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
    })

    const messageContent = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: interactive
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })

  } catch (e) {
    console.error('[Play Store Carrusel] Error:', e)
    await conn.sendMessage(m.chat, { text: `🕸 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['playstore <texto>']
handler.tags = ['buscadores']
handler.command = ['playstore', 'apk']

export default handler