import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys'

async function pinterestDownload(url) {
  const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'es-419,es;q=0.9,en;q=0.8'
  }
  
  const res = await fetch(url, { headers, redirect: 'follow' })
  const html = await res.text()
  const $ = cheerio.load(html)

  const mp4Match = html.match(/"(https:\/\/[^"]+\.mp4)"/i)
  if (mp4Match && mp4Match[1]) {
    return [{ url: mp4Match[1].replace(/\\/g, ''), type: 'video' }]
  }

  const ogVideo = $('meta[property="og:video:secure_url"]').attr('content') || $('meta[property="og:video"]').attr('content')
  if (ogVideo) {
    return [{ url: ogVideo, type: 'video' }]
  }

  const scriptData = $('script#__PBN_DATA__').html() || $('script#initial-state').html()
  if (scriptData) {
    const videoRegex = /(https:\/\/[^"]+\.mp4)/i
    const match = scriptData.match(videoRegex)
    if (match && match[1]) {
      return [{ url: match[1], type: 'video' }]
    }
  }

  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage) {
    return [{ url: ogImage, type: 'image' }]
  }

  throw new Error('No se pudo extraer el contenido del link')
}

async function searchPinterest(query, limit = 10) {
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
  const medias = []

  for (const item of results) {
    let added = false
    
    if (item?.videos?.video_list) {
      const vlist = item.videos.video_list
      for (const k in vlist) {
        if (vlist[k]?.url && vlist[k].url.endsWith('.mp4')) {
          medias.push({ url: vlist[k].url, type: 'video' })
          added = true
          break
        }
      }
    }

    if (!added) {
      const img = item?.images?.orig?.url || item?.images?.['564x']?.url || item?.images?.['236x']?.url
      if (img) {
        medias.push({ url: img, type: 'image' })
      }
    }

    if (medias.length >= limit) break
  }

  return medias
}

let handler = async (m, { conn, args, text }) => {
  const input = args[0] || text
  if (!input) return m.reply('《✧》 Ingresa un link o palabra clave para Pinterest.')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })

    if (/^https?:\/\/(www\.)?(pin\.it|pinterest\.[a-z.]+)/i.test(input)) {
      const data = await pinterestDownload(input)
      if (!data || !data.length) throw new Error('Sin resultados válidos en el enlace.')
      
      for (const item of data) {
        const url = item.url
        if (!url) continue
        await conn.sendFile(
          m.chat,
          url,
          item.type === 'video' ? 'pinterest.mp4' : 'pinterest.jpg',
          '',
          m
        )
      }
    } else {
      const results = await searchPinterest(input, 10)
      if (!results || !results.length) throw new Error('No se encontraron resultados para tu búsqueda.')

      const medias = []
      for (let i = 0; i < results.length; i++) {
        try {
          const r = results[i]
          const res = await fetch(r.url)
          if (!res.ok) continue
          const buf = await res.buffer()
          medias.push({ type: r.type, data: buf })
        } catch (err) {
          continue
        }
      }

      if (!medias.length) throw new Error('Fallo al descargar los archivos de la búsqueda.')

      const album = generateWAMessageFromContent(m.chat, {
        albumMessage: { expectedImageCount: medias.length }
      }, {})
      
      await conn.relayMessage(m.chat, album.message, { messageId: album.key.id })

      for (let i = 0; i < medias.length; i++) {
        const media = medias[i]
        const msg = await prepareWAMessageMedia(
          media.type === 'video' ? { video: media.data } : { image: media.data },
          { upload: conn.waUploadToServer }
        )
        const content = media.type === 'video'
          ? { videoMessage: msg.videoMessage, caption: i === 0 ? `✧ Álbum de Pinterest para *${input}*` : undefined }
          : { imageMessage: msg.imageMessage, caption: i === 0 ? `✧ Álbum de Pinterest para *${input}*` : undefined }

        const message = generateWAMessageFromContent(m.chat, content, {})
        message.message.messageContextInfo = {
          messageAssociation: { associationType: 1, parentMessageKey: album.key }
        }
        await conn.relayMessage(m.chat, message.message, { messageId: message.key.id })
      }
    }
    
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: `✿ Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['pinterest']
handler.tags = ['buscadores']
handler.command = ['pinterest', 'pin']
handler.group = true

export default handler
