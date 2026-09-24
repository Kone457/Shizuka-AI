import axios from "axios"
import * as cheerio from "cheerio"
import fetch from "node-fetch"
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys'

async function wallpaper(title, page = 1) {
  const { data } = await axios.get("https://www.besthdwallpaper.com/search", {
    params: {
      CurrentPage: page,
      q: title
    },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    }
  })

  const $ = cheerio.load(data)
  let results = []

  $("div.grid-item").each((_, el) => {
    let img = $(el).find("picture img").attr("data-src") ||
              $(el).find("picture img").attr("src")

    let title = $(el).find("picture img").attr("alt") || "Wallpaper"

    if (img && !img.startsWith("http")) {
      img = "https://www.besthdwallpaper.com" + img
    }

    results.push({
      title,
      image: img
    })
  })

  return results
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('《✧》 Ingresa el título del wallpaper.')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })
    const query = args.join(' ')
    const res = await wallpaper(query, 1)

    if (!res || res.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('《✧》 No se encontraron resultados.')
    }

    const medias = []
    for (let i = 0; i < res.slice(0, 5).length; i++) {
      const imgBuffer = await (await fetch(res[i].image)).buffer()
      medias.push({ type: "image", data: imgBuffer })
    }

    const album = generateWAMessageFromContent(m.chat, {
      albumMessage: {
        expectedImageCount: medias.length
      }
    }, {})

    await conn.relayMessage(m.chat, album.message, {
      messageId: album.key.id
    })

    for (let i = 0; i < medias.length; i++) {
      const msg = await prepareWAMessageMedia(
        { image: medias[i].data },
        { upload: conn.waUploadToServer }
      )

      const message = generateWAMessageFromContent(m.chat, {
        imageMessage: msg.imageMessage,
        caption: i === 0
          ? `✧ Álbum de Wallpapers para *${query}*`
          : undefined
      }, {})

      message.message.messageContextInfo = {
        messageAssociation: {
          associationType: 1,
          parentMessageKey: album.key
        }
      }

      await conn.relayMessage(m.chat, message.message, {
        messageId: message.key.id
      })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, {
      text: `✿ Error [${e.message || e}]`
    }, { quoted: m })
  }
}

handler.help = ['wallpaper']
handler.tags = ['buscadores']
handler.command = ['wallpaper']

export default handler