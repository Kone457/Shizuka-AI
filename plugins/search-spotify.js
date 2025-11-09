import fetch from 'node-fetch'
import moment from 'moment-timezone'
import { default as WA, proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('> Ingresa el nombre de una canción o artista para buscar en Spotify.')

  try {
    const res = await fetch(`https://api.vreden.my.id/api/v1/search/spotify?query=${encodeURIComponent(text)}&limit=10`)
    const json = await res.json()

    if (!json.status || !json.result?.search_data?.length) {
      return m.reply('> No se encontraron resultados en Spotify.')
    }

    const tiempo = moment.tz('America/Bogota').format('DD MMM YYYY')
    const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

    const cards = []
    const tracks = json.result.search_data.slice(0, 10)

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      let headerObj

      try {
        const imgBuffer = await (await fetch(track.cover_img)).buffer()
        const media = await prepareWAMessageMedia({ image: imgBuffer }, { upload: conn.waUploadToServer })
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: true, imageMessage: media.imageMessage })
      } catch {
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
      }

      const bodyText = `🎵 ${track.title}\n👤 ${track.artist}\n💽 ${track.album}\n⏱️ ${track.duration}`
      const footerText = `📅 ${track.release_date} • Popularidad: ${track.popularity}`

      const card = {
        header: headerObj,
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: bodyText }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: footerText }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '🔗 Abrir en Spotify',
                id: track.song_link
              })
            }
          ]
        })
      }

      cards.push(card)
    }

    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ text: `✧ Resultados de Spotify para *${json.result.query}*` }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: `Total: ${json.result.count} canciones` }),
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
    console.error('[Spotify Carrusel] Error:', e)
    await conn.sendMessage(m.chat, { text: `🕸 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['spotify <texto>']
handler.tags = ['buscadores']
handler.command = ['spotify', 'spot']

export default handler