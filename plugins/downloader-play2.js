import yts from 'yt-search'
import axios from 'axios'
import { getBuffer } from '../lib/message.js'
import sharp from 'sharp'

const UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

function extractYouTubeId(input) {
  const s = String(input || "").trim()
  if (!s) return null

  const m1 = s.match(/(?:v=|\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (m1?.[1]) return m1[1]

  const m2 = s.match(/^[A-Za-z0-9_-]{11}$/)
  if (m2?.[0]) return m2[0]

  return null
}

function baseHeaders(ref) {
  return {
    "User-Agent": UA,
    Accept: "application/json, text/plain, */*",
    Origin: ref,
    Referer: `${ref}/`
  }
}

async function getSanityKey() {
  const ref = "https://frame.y2meta-uk.com"

  const res = await axios.get("https://cnv.cx/v2/sanity/key", {
    headers: baseHeaders(ref)
  })

  const key = res?.data?.key
  if (!key) throw new Error("SANITYKEY_MISSING")

  return { key, ref }
}

function toForm(data) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(data)) p.set(k, String(v))
  return p
}

async function y2mateVideo(url) {
  const videoId = extractYouTubeId(url)
  if (!videoId) throw new Error("INVALID_YOUTUBE_URL")

  const { key, ref } = await getSanityKey()

  const payload = {
    link: `https://youtu.be/${videoId}`,
    format: "mp4",
    videoQuality: 720,
    filenameStyle: "pretty",
    vCodec: "h264"
  }

  const res = await axios.post(
    "https://cnv.cx/v2/converter",
    toForm(payload),
    {
      headers: {
        ...baseHeaders(ref),
        "Content-Type": "application/x-www-form-urlencoded",
        key
      }
    }
  )

  const direct = res?.data?.url
  if (!direct) throw new Error("NO_VIDEO_URL")

  return direct
}

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',

  run: async (client, m, args) => {
    try {

      if (!args[0]) {
        return m.reply(
`🌸 Shizuka AI:
> Por favor dime qué video deseas.`)
      }

      const query = args.join(' ')
      let url, videoData

      if (!isYTUrl(query)) {
        const search = await yts(query)

        if (!search.all.length)
          return m.reply('🥀 No encontré resultados.')

        videoData = search.all[0]
        url = videoData.url
      } else {
        const videoId = extractYouTubeId(query)
        videoData = await yts({ videoId })
        url = query
      }

      const title = videoData.title
      const thumbBuffer = await getBuffer(videoData.image || videoData.thumbnail)

      const vistas = (videoData.views || 0).toLocaleString()
      const canal = videoData.author?.name || 'YouTube'

      let infoMessage =
`✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨

🎬 Tu video se está preparando

• 🏷️ Título: ${title}
• 🎙️ Canal: ${canal}
• ⏳ Duración: ${videoData.timestamp || 'N/A'}
• 👀 Vistas: ${vistas}

> 💎 Enviando video...`

      await client.sendMessage(
        m.chat,
        { image: thumbBuffer, caption: infoMessage },
        { quoted: m }
      )

      const videoUrl = await y2mateVideo(url)
      const videoBuffer = await getBuffer(videoUrl)

      const thumb300 = await sharp(thumbBuffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer()

      await client.sendMessage(
        m.chat,
        {
          video: videoBuffer,
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`,
          jpegThumbnail: thumb300,
          caption: `🎬 ${title}`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)

      m.reply(
`🥀 Shizuka AI:
> Hubo un error al descargar el video.`)
    }
  }
}