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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    },
    maxRedirects: 5
  })
  const finalUrl = res.request.res.responseUrl || url
  const { data } = await axios.get(finalUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    }
  })
  const $ = cheerio.load(data)
  const results = []
  const ogVideo = $('meta[property="og:video"]').attr('content')
  const ogVideoSecure = $('meta[property="og:video:secure_url"]').attr('content')
  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogVideo) results.push(ogVideo)
  if (ogVideoSecure && !results.includes(ogVideoSecure)) results.push(ogVideoSecure)
  if (!results.length && ogImage) results.push(ogImage)
  if (!results.length) {
    const match = data.match(/"url":"(https:\/\/[^"]+\.(?:mp4|jpg|png))"/g)
    if (match) {
      for (const m of match) {
        const u = m.match(/"url":"([^"]+)"/)?.[1]
        if (u && !results.includes(u)) results.push(u)
      }
    }
  }
  return results
}

async function searchPinterest(query, limit = 10) {
  const url = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%2C%22rs%22%3A%22typed%22%2C%22redux_normalize_feed%22%3Atrue%2C%22source_url%22%3A%22%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped%22%7D%2C%22context%22%3A%7B%7D%7D`
  const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
  }
  const res = await fetch(url, { headers })
  const text = await res.text()
  if (!text.startsWith('{')) throw new Error('Pinterest bloqueó la petición')
  const json = JSON.parse(text)
  const results = json?.resource_response?.data?.results || []
  const images = []
  for (const item of results) {
    const img =
      item?.images?.orig?.url ||
      item?.images?.['564x']?.url ||
      item?.images?.['236x']?.url
    if (img) images.push(img)
    if (images.length >= limit) break
  }
  return images
}

let handler = async (m, { conn, args, text }) => {
  const input = args[0] || text
  if (!input) return m.reply('《✧》 Ingresa un link o palabra clave para Pinterest.')
  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })
    if (/^https?:\/\/(www\.)?pin/i.test(input)) {
      const data = await pinterestDownload(input)
      if (!data.length) throw new Error('Sin resultados en el link')
      for (let url of data) {
        await conn.sendFile(
          m.chat,
          url,
          url.includes('.mp4') ? 'pinterest.mp4' : 'pinterest.jpg',
          '',
          m
        )
      }
    } else {
      const images = await searchPinterest(input, 10)
      if (!images.length) throw new Error('No se encontraron resultados')
      const medias = []
      for (let i = 0; i < images.length; i++) {
        const imgBuffer = await (await fetch(images[i])).buffer()
        medias.push({ type: "image", data: imgBuffer })
      }
      const album = generateWAMessageFromContent(m.chat, {
        albumMessage: { expectedImageCount: medias.length }
      }, {})
      await conn.relayMessage(m.chat, album.message, { messageId: album.key.id })
      for (let i = 0; i < medias.length; i++) {
        const msg = await prepareWAMessageMedia(
          { image: medias[i].data },
          { upload: conn.waUploadToServer }
        )
        const message = generateWAMessageFromContent(m.chat, {
          imageMessage: msg.imageMessage,
          caption: i === 0 ? `✧ Álbum de Pinterest para *${input}*` : undefined
        }, {})
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