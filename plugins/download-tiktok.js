import axios from 'axios'
import * as cheerio from 'cheerio'

const isUrl = (text) => /^https?:\/\/[^\s]+$/i.test(text)

const isTikTokUrl = (text) => {
  try {
    const { hostname } = new URL(text)
    return [
      'tiktok.com',
      'www.tiktok.com',
      'm.tiktok.com',
      'vt.tiktok.com',
      'vm.tiktok.com'
    ].includes(hostname)
  } catch {
    return false
  }
}

async function resolveTikTokUrl(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 5,
      validateStatus: null,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    return res.request?.res?.responseUrl || url
  } catch {
    return url
  }
}

async function tiktokApi(url) {
  const params = new URLSearchParams()
  params.set('url', url)
  params.set('hd', '1')

  const res = await axios.post('https://tikwm.com/api/', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://tikwm.com/'
    }
  })

  return res.data
}

async function tiktokFallback(url) {
  const headers = {
    accept: '*/*',
    origin: 'https://ttsave.app',
    referer: 'https://ttsave.app/en',
    'user-agent': 'Mozilla/5.0'
  }

  const { data } = await axios.post(
    'https://ttsave.app/download',
    { query: url, language_id: '1' },
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
    return conn.reply(m.chat, '《✧》 Ingresa un enlace o búsqueda válida.', m)
  }

  await conn.sendMessage(m.chat, {
    react: { text: '⏳', key: m.key }
  })

  try {
    let video
    let text = '✿ Aquí tienes.'

    if (isTikTokUrl(args[0])) {
      let url = args[0]

      if (
        url.includes('vt.tiktok.com') ||
        url.includes('vm.tiktok.com')
      ) {
        url = await resolveTikTokUrl(url)
      }

      try {
        const res = await tiktokApi(url)

        if (res?.result?.data) {
          video = res.result.data.play || res.result.data.hdplay

          if (res.result.data.title) {
            text += `\n\n📝 ${res.result.data.title}`
          }
        }
      } catch {}

      if (!video) {
        const fb = await tiktokFallback(url)

        video = fb.video

        if (fb.desc) {
          text += `\n\n📝 ${fb.desc}`
        }
      }
    } else if (!isUrl(args[0])) {
      const res = await fetch(
        `${api.url}/search/tiktok?q=${encodeURIComponent(
          args.join(' ')
        )}&apikey=${api.key}`
      )

      const json = await res.json()

      if (!json.status || !json.result?.length) {
        throw new Error('No se encontró ningún video')
      }

      const first = json.result[0]

      try {
        const username = first.author?.unique_id

        if (username) {
          const fullUrl = `https://www.tiktok.com/@${username}/video/${first.video_id}`

          const apiRes = await tiktokApi(fullUrl)

          if (apiRes?.result?.data) {
            video =
              apiRes.result.data.play || apiRes.result.data.hdplay

            if (apiRes.result.data.title) {
              text += `\n\n📝 ${apiRes.result.data.title}`
            }
          }
        }
      } catch (e) {
        console.error(
          'Error tiktokApi búsqueda:',
          e.message
        )
      }

      if (!video && first.play) {
        video = first.play

        if (first.title) {
          text += `\n\n📝 ${first.title}`
        }
      }
    } else {
      throw new Error('El enlace proporcionado no es de TikTok')
    }

    if (!video) {
      throw new Error('No se pudo obtener el video')
    }

    await conn.sendFile(
      m.chat,
      video,
      'tiktok.mp4',
      text,
      m
    )

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })
  } catch (e) {
    await conn.reply(
      m.chat,
      `❏ Error.\n❏ Detalles: ${e.message}`,
      m
    )

    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    })
  }
}

handler.command = ['tiktok', 'tt']
handler.tags = ['descargas']
handler.help = ['tiktok']
handler.group = true

export default handler