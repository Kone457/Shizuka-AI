import fetch from 'node-fetch'
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys'

async function searchPinterestVideos(query, limit = 10) {
  const url = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%2C%22rs%22%3A%22typed%22%2C%22redux_normalize_feed%22%3Atrue%2C%22source_url%22%3A%22%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped%22%7D%2C%22context%22%3A%7B%7D%7D`

  const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'es-419,es;q=0.9,en;q=0.8',
    'referer': 'https://id.pinterest.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36',
    'x-app-version': 'c056fb7',
    'x-pinterest-appstate': 'active',
    'x-pinterest-pws-handler': 'www/index.js',
    'x-pinterest-source-url': '/',
    'x-requested-with': 'XMLHttpRequest'
  }

  const res = await fetch(url, { headers })
  const text = await res.text()

  if (!text.startsWith('{')) throw new Error('Pinterest bloqueó la petición')

  const json = JSON.parse(text)
  const results = json?.resource_response?.data?.results || []
  const videos = []

  for (const item of results) {
    if (item?.videos?.video_list) {
      const vlist = item.videos.video_list
      let bestVideoUrl = null
      
      for (const k in vlist) {
        if (vlist[k]?.url && vlist[k].url.endsWith('.mp4')) {
          bestVideoUrl = vlist[k].url
          break
        }
      }

      if (bestVideoUrl) {
        videos.push(bestVideoUrl)
      }
    }

    if (videos.length >= limit) break
  }

  return videos
}

let handler = async (m, { conn, args, text }) => {
  const input = args[0] || text
  if (!input) return m.reply('《✧》 Ingresa una palabra clave para buscar vídeos en Pinterest.')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })

    const videoUrls = await searchPinterestVideos(input, 10)

    if (!videoUrls.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('《✧》 No se encontraron vídeos para tu búsqueda.')
    }

    const medias = []
    for (let i = 0; i < videoUrls.length; i++) {
      try {
        const res = await fetch(videoUrls[i])
        if (!res.ok) continue
        const buf = await res.buffer()
        medias.push(buf)
      } catch (err) {
        continue
      }
    }

    if (!medias.length) throw new Error('Fallo al descargar los vídeos de la búsqueda.')

    const album = generateWAMessageFromContent(m.chat, {
      albumMessage: { expectedImageCount: medias.length }
    }, {})
    
    await conn.relayMessage(m.chat, album.message, { messageId: album.key.id })

    for (let i = 0; i < medias.length; i++) {
      const msg = await prepareWAMessageMedia(
        { video: medias[i] },
        { upload: conn.waUploadToServer }
      )
      
      const message = generateWAMessageFromContent(m.chat, {
        videoMessage: {
          ...msg.videoMessage,
          caption: i === 0 ? `✧ Álbum de vídeos en Pinterest para *${input}*` : undefined
        }
      }, {})

      message.message.messageContextInfo = {
        messageAssociation: { associationType: 1, parentMessageKey: album.key }
      }
      
      await conn.relayMessage(m.chat, message.message, { messageId: message.key.id })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: `✿ Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['pinvideo']
handler.tags = ['buscadores']
handler.command = ['pinvideo', 'pinvid']
handler.group = true

export default handler
