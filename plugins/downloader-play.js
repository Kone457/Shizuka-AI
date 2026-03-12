import yts from 'yt-search'
import { getBuffer } from '../lib/message.js'
import axios from 'axios'

const UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"

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
  if (t === "audio" || t === "mp3") {
    const allowed = new Set([64,96,128,160,192,256,320])
    return allowed.has(q) ? q : 128
  }
  const allowed = new Set([144,240,360,480,720,1080,1440,2160])
  return allowed.has(q) ? q : 720
}

function baseHeaders(ref) {
  return {
    "User-Agent": UA,
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "es-US,es-419;q=0.9,es;q=0.8",
    Origin: ref,
    Referer: `${ref}/`,
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "sec-ch-ua": '"Chromium";v="123", "Not(A:Brand";v="24", "Google Chrome";v="123"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"'
  }
}

async function getSanityKey(timeout = 20000) {
  const ref = "https://frame.y2meta-uk.com"
  const res = await axios.get("https://cnv.cx/v2/sanity/key", {
    timeout,
    headers: { ...baseHeaders(ref), "Content-Type": "application/json" },
    validateStatus: () => true
  })
  if (res.status !== 200) throw new Error(`SANITY_KEY_HTTP_${res.status}`)
  const key = res?.data?.key
  if (!key) throw new Error("SANITY_KEY_MISSING")
  return { key, ref }
}

function toForm(data) {
  const p = new URLSearchParams()
  for (const [k,v] of Object.entries(data)) p.set(k, String(v))
  return p
}

function normalizeObj(data) {
  if data === "object") return data
  if (typeof data === "string") {
    try { return JSON.parse(data) } catch { return null }
  }
  return null
}

async function y2mateDirect(url, opts = {}) {
  const videoId = extractYouTubeId(url)
  if (!videoId) return { status:false, error:"INVALID_YOUTUBE_URL" }
  const typeRaw = String(opts.type || "audio").toLowerCase()
  const type = typeRaw === "video" || typeRaw === "mp4" ? "video" : "audio"
  const format = type === "video" ? "mp4" : "mp3"
  const quality = pickQuality(type, opts.quality)
  const timeout = Number(opts.timeout || 45000)
  const { key, ref } = await getSanityKey(Math.min(timeout,20000))
  const payload = {
    link: `https://youtu.be/${videoId}`,
    format,
    audioBitrate: type === "audio" ? quality : 128,
    videoQuality: type === "video" ? quality : 720,
    filenameStyle: "pretty",
    vCodec: "h264"
  }
  const res = await axios.post("https://cnv.cx/v2/converter", toForm(payload), {
    timeout,
    headers: { ...baseHeaders(ref), Accept:"*/*", "Content-Type":"application/x-www-form-urlencoded", key },
    validateStatus: () => true
  })
  if (res.status !== 200) return { status:false, error:`CONVERTER_HTTP_${res.status}` }
  const obj = normalizeObj(res.data)
  const direct = obj?.url
  if (!direct) return { status:false, error:"NO_URL_IN_RESPONSE", raw:obj ?? res.data }
  return { status:true, url:direct, info:{
    title: obj?.title || null,
    thumbnail: obj?.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: obj?.duration || null,
    channel: obj?.channel || null
  }}
}

export default {
  command: ['play','mp3','ytmp3','ytaudio','playaudio'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) return m.reply('🌸 *Shizuka AI:* \n> Por favor, dame el título o link de la canción que deseas escuchar.')
      const query = args.join(' ')
      let url, videoData
      if (!extractYouTubeId(query)) {
        const search = await yts(query)
        if (!search.all.length) return m.reply('🥀 *Lo siento,* \n> no encontré resultados para esa búsqueda.')
        videoData = search.all[0]
        url = videoData.url
      } else {
        url = query
        videoData = await yts({ videoId: extractYouTubeId(url) })
      }
      const title = videoData.title
      const thumbBuffer = await getBuffer(videoData.image || videoData.thumbnail)
      const vistas = (videoData.views || 0).toLocaleString()
      const canal = videoData.author?.name || 'YouTube'
      let infoMessage = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨\n\n`
      infoMessage += `🎵 *Audio preparado con delicadeza*\n\n`
      infoMessage += `• 🏷️ *Título:* ${title}\n`
      infoMessage += `• 🎙️ *Canal:* ${canal}\n`
      infoMessage += `• ⏳ *Duración:* ${videoData.timestamp || 'N/A'}\n`
      infoMessage += `• 👀 *Vistas:* ${vistas}\n\n`
      infoMessage += `> 💎 *Enviando tu música, espera un instante...*`
      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })
      const result = await y2mateDirect(url, { type:"audio", quality:128 })
      if (!result.status || !result.url) return m.reply('🥀 *Ups,* \n> hubo un pequeño problema técnico al extraer el audio.')
      const audioBuffer = await getBuffer(result.url)
      await client.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${title}.mp3`
      }, { quoted: m })
    } catch (e) {
      console.error(e)
      await m.reply('🥀 *Shizuka AI:* \n> Hubo un fallo inesperado al procesar tu solicitud.')
    }
  }
}