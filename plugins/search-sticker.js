import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
import { getBotConfig } from '../lib/botconfig.js'

async function searchPinterest(query, limit = 10) {
  query = String(query).trim()

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

const handler = async (m, { conn, args }) => {
  const botname = getBotConfig(conn, 'botname')
  const dev = global.dev
  if (!args[0]) return conn.reply(m.chat, '《✧》 Ingresa el nombre del pack.', m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    const query = args.join(' ')

    const results = await searchPinterest(query, 5)
    const images = results.filter(r => r.type === 'image')

    if (!images.length) {
      return conn.reply(m.chat, '❏ No se encontraron stickers.', m)
    }

    const stickers = images.slice(0, 5)
    const hora = new Date().toLocaleString('es-ES', {
      timeZone: 'America/Havana',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })

    for (let item of stickers) {
      try {
        const res = await fetch(item.url, {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36',
            'referer': 'https://www.pinterest.com/'
          }
        })
        if (!res.ok) continue
        const img = await res.buffer()
        const desc = `\n${botname}\nHora: ${hora}\n${dev}`
        const stiker = await sticker(img, false, `Pinterest: ${query}`, desc)
        await conn.sendMessage(m.chat, {
          sticker: stiker,
          forwardingScore: 0,
          isForwarded: false
        }, { quoted: m })
      } catch (imgErr) {
        continue
      }
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.reply(m.chat, `❏ Error al obtener stickers.\n❏ Detalles: ${e.message}`, m)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.command = ['stickerpack']
handler.tags = ['buscadores']
handler.help = ['stickerpack']
handler.group = true
handler.restrict = false

export default handler