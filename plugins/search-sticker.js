import axios from "axios"
import * as cheerio from "cheerio"
import { sticker } from '../lib/sticker.js'

async function getsticker(query) {
  const { data } = await axios.get(`https://getstickerpack.com/stickers?query=${query}`)
  const $ = cheerio.load(data)

  let source = []
  let link = []

  $('#stickerPacks > div > div:nth-child(3) > div > a').each((i, el) => {
    source.push($(el).attr('href'))
  })

  const random = source[Math.floor(Math.random() * source.length)]
  const res = await axios.get(random)
  const $$ = cheerio.load(res.data)

  $$('#stickerPack > div > div.row > div > img').each((i, el) => {
    link.push($$(el).attr('src').replace(/&d=200x200/g, ''))
  })

  return {
    status: 200,
    title: $$('#intro > div > div > h1').text(),
    sticker_url: link
  }
}

const handler = async (m, { conn, args }) => {
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
      const img = (await axios.get(url, { responseType: 'arraybuffer' })).data
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