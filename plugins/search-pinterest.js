import axios from 'axios'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys'

async function pinterestDownload(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    maxRedirects: 5
  })
  const finalUrl = res.request?.res?.responseUrl || url
  const { data } = await axios.get(finalUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  })
  const $ = cheerio.load(data)
  const results = []

  const scriptTag = $('#__PBN_DATA__').html() || $('#initial-state').html()
  if (scriptTag) {
    try {
      const parsed = JSON.parse(scriptTag)
      const pinsData = parsed.resources?.data?.PinResource || parsed.pins || {}
      for (const key in pinsData) {
        const pin = pinsData[key]?.data || pinsData[key]
        if (pin?.videos?.video_list) {
          const vlist = pin.videos.video_list
          let bestVideo = null
          for (const k in vlist) {
            if (!bestVideo || (vlist[k].width && vlist[k].width > (bestVideo.width || 0))) {
              bestVideo = vlist[k]
            }
          }
          if (bestVideo?.url) {
            results.push({ url: bestVideo.url, type: 'video' })
            return results
          }
        }
      }
    } catch (e) {}
  }

  const vMatch = data.match(/"v720P":\s*\{\s*"url":\s*"([^"]+)"/i) ||
                 data.match(/"vEXP":\s*\{\s*"url":\s*"([^"]+)"/i) ||
                 data.match(/"vHLS":\s*\{\s*"url":\s*"([^"]+)"/i) ||
                 data.match(/"video_list":\s*\{[^}]*"url":\s*"([^"]+)"/i)
  if (vMatch && vMatch[1]) {
    const videoUrl = vMatch[1].replace(/\\/g, '')
    results.push({ url: videoUrl, type: 'video' })
    return results
  }

  const ogVideo = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:secure_url"]').attr('content')
  if (ogVideo) {
    results.push({ url: ogVideo, type: 'video' })
    return results
  }

  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage) {
    results.push({ url: ogImage, type: 'image' })
    return results
  }

  const imgMatch = data.match(/"url":"(https:\/\/[^"]+\.(?:mp4|jpg|png|webp))"/g)
  if (imgMatch) {
    for (const m of imgMatch) {
      const u = m.match(/"url":"([^"]+)"/)?.[1]
      if (u && !results.find(r => r.url === u)) {
        results.push({ url: u, type: u.includes('.mp4') ? 'video' : 'image' })
      }
    }
  }

  return results
}

async function searchPinterest(query, limit = 10) {
  const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D`
  const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest',
    'referer': 'https://www.pinterest.com/'
  }
  const res = await fetch(url, { headers })
  const text = await res.text()
  if (!text.startsWith('{')) throw new Error('Pinterest bloqueó la petición')
  const json = JSON.parse(text)
  const results = json?.resource_response?.data?.results || []
  const medias = []
  for (const item of results) {
    if (!item) continue
    let added = false
    if (item.videos?.video_list) {
      const vlist = item.videos.video_list
      for (const k of Object.keys(vlist)) {
        const vurl = vlist[k]?.url || vlist[k]?.src
        if (vurl) {
          medias.push({ url: vurl, type: 'video' })
          added = true
          break
        }
      }
    }
    if (!added) {
      const img =
        item?.images?.orig?.url ||
        item?.images?.['564x']?.url ||
        item?.images?.['236x']?.url ||
        item?.image?.original?.url ||
        item?.image?.url
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
      if (!data.length) throw new Error('Sin resultados en el link')
      for (let item of data) {
        const url = item.url
        if (!url) continue
        await conn.sendFile(
          m.chat,
          url,
          item.type === 'video' || url.includes('.mp4') ? 'pinterest.mp4' : 'pinterest.jpg',
          '',
          m
        )
      }
    } else {
      const results = await searchPinterest(input, 10)
      if (!results.length) throw new Error('No se encontraron resultados')
      const medias = []
      for (let i = 0; i < results.length; i++) {
        const r = results[i]
        try {
          const res = await fetch(r.url)
          const buf = await res.buffer()
          medias.push({ type: r.type === 'video' ? 'video' : 'image', data: buf })
        } catch (err) {
          continue
        }
      }
      if (!medias.length) throw new Error('Error al descargar el contenido multimedia')
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
    await conn.sendMessage(m.chat, { text: `✿ Error [${e.message}]` }, { quoted: m })
  }
}

handler.help = ['pinterest']
handler.tags = ['buscadores']
handler.command = ['pinterest', 'pin']
handler.group = true

export default handler
