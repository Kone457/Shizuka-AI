import fetch from 'node-fetch'
import moment from 'moment-timezone'
import { default as WA, proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('> Ingresa una palabra clave para buscar en Pinterest.')

  try {
    const res = await fetch(`https://api.vreden.my.id/api/v1/search/pinterest?query=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !json.result?.search_data?.length) {
      return m.reply('> No se encontraron resultados para tu búsqueda.')
    }

    const tiempo = moment.tz('America/Bogota').format('DD MMM YYYY')
    const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

    const cards = []
    const images = json.result.search_data.slice(0, 10)

    for (let i = 0; i < images.length; i++) {
      const imgUrl = images[i]
      let headerObj

      try {
        const imgBuffer = await (await fetch(imgUrl)).buffer()
        const media = await prepareWAMessageMedia({ image: imgBuffer }, { upload: conn.waUploadToServer })
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: true, imageMessage: media.imageMessage })
      } catch {
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
      }

      const card = {
        header: headerObj,
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: `🖼️ Resultado ${i + 1}\n🔍 Búsqueda: ${json.result.query}` }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `Pinterest • ${tiempo} ${tiempo2}` }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      }

      cards.push(card)
    }

    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ text: `✧ Resultados de Pinterest para *${json.result.query}*` }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: `Total: ${json.result.count} imágenes` }),
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
    console.error('[Pinterest Carrusel] Error:', e)
    await conn.sendMessage(m.chat, { text: `🕸 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['pinterest <texto>']
handler.tags = ['buscadores']
handler.command = ['pinterest', 'pin']

export default handler