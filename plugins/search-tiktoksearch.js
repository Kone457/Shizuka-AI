import fetch from 'node-fetch'
import { default as WA, proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('《✧》 Ingresa una palabra clave para buscar en TikTok.')

  try {
    const res = await fetch(`${api.url2}/v1/search/tiktok?query=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !json.result?.search_data?.length) {
      return m.reply('《✧》 No se encontraron videos para tu búsqueda.')
    }

    const cards = []
    const videos = json.result.search_data.slice(0, 10)

    for (let i = 0; i < videos.length; i++) {
      const vid = videos[i]
      let headerObj

      try {
        const imgBuffer = await (await fetch(vid.cover)).buffer()
        const media = await prepareWAMessageMedia({ image: imgBuffer }, { upload: conn.waUploadToServer })
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: true, imageMessage: media.imageMessage })
      } catch {
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
      }

      const bodyText = `🎬 ${vid.title.slice(0, 80)}\n👤 ${vid.author.nickname}\n⏱️ ${Math.floor(vid.duration / 60)}:${(vid.duration % 60).toString().padStart(2, '0')} min`
      const footerText = `📍 Región: ${vid.region} • Resultado ${i + 1}`

      const card = {
        header: headerObj,
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: bodyText }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: footerText }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '▶️ Ver video',
                url: vid.data[0]?.url || `https://www.tiktok.com/@${vid.author.nickname}/video/${vid.video_id}`
              })
            }
          ]
        })
      }

      cards.push(card)
    }

    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ text: `✧ Resultados de TikTok para *${json.result.query}*` }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: `Total: ${json.result.count} videos` }),
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
    console.error('[TikTok Search Carrusel] Error:', e)
    await conn.sendMessage(m.chat, { text: `《✧》 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['tiktoksearch']
handler.tags = ['buscadores']
handler.command = ['tiktoksearch', 'ttsearch']

export default handler