import axios from "axios"
import * as cheerio from "cheerio"
import { sticker } from '../lib/sticker.js'
import { getBotConfig } from '../lib/botconfig.js'

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Referer': 'https://getstickerpack.com/'
  }
})

async function getsticker(query) {
  const { data } = await axiosInstance.get(`https://getstickerpack.com/stickers?query=${encodeURIComponent(query)}`)
  const $ = cheerio.load(data)

  let source = []
  let link = []

  $('#stickerPacks > div > div:nth-child(3) > div > a').each((i, el) => {
    const href = $(el).attr('href')
    if (href) source.push(href.startsWith('http') ? href : `https://getstickerpack.com${href}`)
  })

  if (source.length === 0) return { status: 404, title: '', sticker_url: [] }

  const random = source[Math.floor(Math.random() * source.length)]
  const res = await axiosInstance.get(random, { headers: { 'Referer': 'https://getstickerpack.com/' } })
  const $$ = cheerio.load(res.data)

  $$('#stickerPack > div > div.row > div > img').each((i, el) => {
    const src = $$(el).attr('src')
    if (src) link.push(src.replace(/&d=200x200/g, ''))
  })

  return {
    status: 200,
    title: $$('#intro > div > div > h1').text(),
    sticker_url: link
  }
}

const handler = async (m, { conn, args }) => {
  const botname = getBotConfig(conn, 'botname')
  const dev = global.dev
  if (!args[0]) return conn.reply(m.chat, '《✧》 Ingresa el nombre del pack.', m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    const query = args.join(' ')
    const res = await getsticker(query)

    if (!res || !res.sticker_url || res.sticker_url.length === 0) {
      return conn.reply(m.chat, '❏ No se encontraron stickers.', m)
    }

    const stickers = res.sticker_url.slice(0, 5)
    const hora = new Date().toLocaleString('es-ES', {
      timeZone: 'America/Havana',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })

    for (let url of stickers) {
      const img = (await axiosInstance.get(url, { responseType: 'arraybuffer', headers: { 'Referer': 'https://getstickerpack.com/' } })).data
      const desc = `\n${botname}\nHora: ${hora}\n${dev}`
      const stiker = await sticker(img, false, res.title || 'StickerPack', desc)
      await conn.sendMessage(m.chat, {
        sticker: stiker,
        forwardingScore: 0,
        isForwarded: false
      }, { quoted: m })
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