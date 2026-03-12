import yts from 'yt-search'
import axios from 'axios'
import { getBuffer } from '../lib/message.js'

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

function pickQuality(type, quality) {
  const t = String(type || "").toLowerCase()
  const q = Number(quality)

  if (t === "audio") {
    const allowed = new Set([64, 96, 128, 160, 192, 256, 320])
    return allowed.has(q) ? q : 128
  }

  return 720
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

async function y2mateDirect(url) {
  const videoId = extractYouTubeId(url)
  if (!videoId) throw new Error("INVALID_YOUTUBE_URL")

  const { key, ref } = await getSanityKey()

  const payload = {
    link: `https://youtu.be/${videoId}`,
    format: "mp3",
    audioBitrate: 128,
    filenameStyle: "pretty"
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
  if (!direct) throw new Error("NO_URL")

  return direct
}

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',

  run: async (client, m, args) => {
    try {

      if (!args[0]) {
        return m.reply(
`🌸 Shizuka AI:
> Por favor, dame el título o link de la canción.`)
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

🎵 Audio preparado con delicadeza

• 🏷️ Título: ${title}
• 🎙️ Canal: ${canal}
• ⏳ Duración: ${videoData.timestamp || 'N/A'}
• 👀 Vistas: ${vistas}

> 💎 Enviando tu música...`

      await client.sendMessage(
        m.chat,
        { image: thumbBuffer, caption: infoMessage },
        { quoted: m }
      )

      const audioUrl = await y2mateDirect(url)
      const audioBuffer = await getBuffer(audioUrl)

      await client.sendMessage(
        m.chat,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      m.reply(
`🥀 Shizuka AI:
> Hubo un error al descargar el audio.`)
    }
  }
}