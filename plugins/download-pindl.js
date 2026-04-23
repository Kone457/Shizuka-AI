import axios from 'axios'
import * as cheerio from 'cheerio'

async function pinterestDownload(url) {
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    maxRedirects: 5
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

let handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.sendMessage(
      m.chat,
      { text: `《✧》 Ingresa el link de Pinterest.` },
      { quoted: m }
    )
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    const data = await pinterestDownload(args[0])

    if (!data || !data.length) throw new Error('Sin resultados')

    for (let url of data) {
      if (!url) continue

      await conn.sendFile(
        m.chat,
        url,
        url.includes('.mp4') ? 'pinterest.mp4' : 'pinterest.jpg',
        '',
        m
      )
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(
      m.chat,
      { text: `❏ Error al procesar el link.\n❏ Detalles: ${e.message}` },
      { quoted: m }
    )
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.help = ['pindl']
handler.tags = ['descargas']
handler.command = ['pinvideo', 'pinvid', 'pindl']
handler.group = true

export default handler
