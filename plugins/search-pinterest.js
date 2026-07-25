import axios from 'axios'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys'

async function pinterestDownload(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      maxRedirects: 5
    })
    
    const html = res.data
    const $ = cheerio.load(html)
    const results = []

    const jsonMatch = html.match(/<script id="__PBN_DATA__" type="application\/json">({.*?})<\/script>/) ||
                      html.match(/<script id="initial-state" type="application\/json">({.*?})<\/script>/)
                    
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1])
        const pinData = data?.resources?.data?.PinResource || data?.pins || {}
        for (const key in pinData) {
          const pin = pinData[key]?.data || pinData[key]
          if (pin?.videos?.video_list) {
            const vlist = pin.videos.video_list
            let bestVideo = null
            for (const k in vlist) {
              if (vlist[k].url && vlist[k].url.endsWith('.mp4')) {
                if (!bestVideo || (vlist[k].width && vlist[k].width > (bestVideo.width || 0))) {
                  bestVideo = vlist[k]
                }
              }
            }
            if (bestVideo?.url) return [{ url: bestVideo.url, type: 'video' }]
          }
        }
      } catch (e) {}
    }

    const videoRegexes = [
      /"v720P":\s*\{\s*"url":\s*"([^"]+)"/i,
      /"v1080P":\s*\{\s*"url":\s*"([^"]+)"/i,
      /"vEXP":\s*\{\s*"url":\s*"([^"]+)"/i,
      /content="(https:\/\/[^"]+\.mp4)"/i
    ]
    
    for (const regex of videoRegexes) {
      const match = html.match(regex)
      if (match && match[1]) {
        return [{ url: match[1].replace(/\\/g, ''), type: 'video' }]
      }
    }

    const ogVideo = $('meta[property="og:video:secure_url"]').attr('content') || $('meta[property="og:video"]').attr('content')
    if (ogVideo) return [{ url: ogVideo, type: 'video' }]

    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) return [{ url: ogImage, type: 'image' }]

    return results
  } catch (error) {
    throw new Error('No se pudo obtener el contenido del enlace')
  }
}

async function searchPinterest(query, limit = 10) {
  try {
    const htmlUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
    const res = await axios.get(htmlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    })

    const html = res.data
    const jsonMatch = html.match(/<script id="__PBN_DATA__" type="application\/json">({.*?})<\/script>/) ||
                      html.match(/<script id="initial-state" type="application\/json">({.*?})<\/script>/)

    const medias = []
    
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1])
        const searchData = data?.resources?.data?.BaseSearchResource || data?.search_results || {}
        const firstKey = Object.keys(searchData)[0]
        const results = searchData[firstKey]?.data?.results || []

        for (const item of results) {
          if (!item) continue
          
          let added = false
          if (item.videos?.video_list) {
            const vlist = item.videos.video_list
            for (const k in vlist) {
              if (vlist[k]?.url) {
                medias.push({ url: vlist[k].url, type: 'video' })
                added = true
                break
              }
            }
          }
          
          if (!added) {
            const img = item?.images?.orig?.url || item?.images?.['736x']?.url || item?.images?.['564x']?.url
            if (img) medias.push({ url: img, type: 'image' })
          }
          
          if (medias.length >= limit) break
        }
        if (medias.length > 0) return medias
      } catch (e) {}
    }

    const $ = cheerio.load(html)
    $('img').each((i, el) => {
      const src = $(el).attr('src')
      if (src && src.includes('pinimg.com') && !src.includes('75x75') && !src.includes('profile')) {
        const highRes = src.replace(/\/(236x|474x|736x)\//, '/originals/')
        if (!medias.some(m => m.url === highRes)) {
          medias.push({ url: highRes, type: 'image' })
        }
      }
    })

    return medias.slice(0, limit)
  } catch (error) {
    throw new Error('No se encontraron resultados en la búsqueda')
  }
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
          item.type === 'video' || url.endsWith('.mp4') ? 'pinterest.mp4' : 'pinterest.jpg',
          '',
          m
        )
      }
    } else {
      const results = await searchPinterest(input, 10)
      if (!results || !results.length) throw new Error('La búsqueda no arrojó resultados.')
      
      const medias = []
      for (let i = 0; i < results.length; i++) {
        const r = results[i]
        try {
          const res = await fetch(r.url)
          if (!res.ok) continue
          const buf = await res.buffer()
          medias.push({ type: r.type === 'video' ? 'video' : 'image', data: buf })
        } catch (err) {
          continue
        }
      }
      
      if (!medias.length) throw new Error('Fallo al procesar los archivos de la búsqueda.')
      
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
