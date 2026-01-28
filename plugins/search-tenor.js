import fetch from 'node-fetch'
import moment from 'moment-timezone'
import { default as WA, proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('> Ingresa una palabra clave para buscar en Tenor.')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })

    const res = await fetch(`https://nexevo-api.vercel.app/search/tenor?q=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !json.result?.results?.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('> No se encontraron resultados.')
    }

    const tiempo = moment.tz('America/Bogota').format('DD MMM YYYY')
    const cards = []
    const results = json.result.results.slice(0, 10)

    for (let i = 0; i < results.length; i++) {
      const gif = results[i]
      let headerObj

      try {
        const buffer = await (await fetch(gif.url)).buffer()
        const media = await prepareWAMessageMedia({ video: buffer, gifPlayback: true }, { upload: conn.waUploadToServer })
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ 
          hasMediaAttachment: true, 
          videoMessage: media.videoMessage 
        })
      } catch {
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
      }

      cards.push({
        header: headerObj,
        body: proto.Message.InteractiveMessage.Body.fromObject({ 
          text: `🎬 *${gif.title}*\n👤 Autor: ${gif.author}\n⚖️ ${(gif.metadata.size / (1024 * 1024)).toFixed(2)} MB` 
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `Tenor Search • ${tiempo}` }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{
            name: "cta_url",
            buttonParamsJson: JSON.stringify({ display_text: "Ver Original", url: gif.page })
          }]
        })
      })
    }

    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ text: `✧ Resultados para: *${json.result.query}*` }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: `Nexevo API • Carlos` }),
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
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['tenor']
handler.tags = ['buscadores']
handler.command = ['tenor', 'gif']

export default handler
