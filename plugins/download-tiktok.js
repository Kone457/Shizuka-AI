import axios from 'axios'
import * as cheerio from 'cheerio'

async function tiktokApi(url) {
  const params = new URLSearchParams()
  params.set('url', url)
  params.set('hd', '1')

  const res = await axios.post('https://tikwm.com/api/', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0'
    }
  })

  return res.data
}

async function tiktokFallback(url) {
  const headers = {
    "accept": "*/*",
    "origin": "https://ttsave.app",
    "referer": "https://ttsave.app/en",
    "user-agent": "Mozilla/5.0"
  }

  const { data } = await axios.post(
    'https://ttsave.app/download',
    { query: url, language_id: "1" },
    { headers }
  )

  const $ = cheerio.load(data)

  return {
    video: $('a.w-full.text-white.font-bold').attr('href'),
    desc: $('p.text-gray-600').text().trim()
  }
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, '《✧》 Ingresa un enlace válido.', m)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let video
    let text = '✿ Aquí tienes.'

    try {
      const res = await tiktokApi(args[0])

      if (res?.data) {
        video = res.data.play || res.data.hdplay
        if (res.data.title) text += `\n\n📝 ${res.data.title}`
      }
    } catch {}

    if (!video) {
      const fb = await tiktokFallback(args[0])
      video = fb.video
      if (fb.desc) text += `\n\n📝 ${fb.desc}`
    }

    if (!video) throw new Error('No se pudo obtener el video')

    await conn.sendFile(m.chat, video, 'tiktok.mp4', text, m)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    await conn.reply(m.chat, `❏ Error.\n❏ Detalles: ${e.message}`, m)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.command = ['tiktok', 'tt']
handler.tags = ['descargas']
handler.help = ['tiktok']
handler.group = true

export default handler