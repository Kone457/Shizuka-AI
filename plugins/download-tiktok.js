

import axios from 'axios'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { writeFileSync, unlinkSync } from 'fs'
import { exec } from 'child_process'

const FALLBACK_API = 'https://aquire-api.vercel.app'

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
    ].includes(hostname.toLowerCase())
  } catch {
    return false
  }
}

async function resolveTikTokUrl(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 5,
      timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    return res.request?.res?.responseUrl || res.config?.url || url
  } catch {
    return url
  }
}

const mp4ToWebp = (input, output) => {
  return new Promise((resolve, reject) => {
    exec(
      `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0" -loop 0 -t 6 -preset default -an -vsync 0 "${output}"`,
      (err) => {
        if (err) reject(err)
        else resolve(output)
      }
    )
  })
}

async function sendMp4Sticker(conn, chat, url, quoted) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const tmpMp4 = path.join(os.tmpdir(), `${id}.mp4`)
  const tmpWebp = path.join(os.tmpdir(), `${id}.webp`)

  try {
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 20 * 1024 * 1024,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    writeFileSync(tmpMp4, Buffer.from(data))
    await mp4ToWebp(tmpMp4, tmpWebp)

    if (!fs.existsSync(tmpWebp)) throw new Error('No se pudo generar el sticker.')

    await conn.sendMessage(chat, {
      sticker: fs.readFileSync(tmpWebp)
    }, { quoted })
  } finally {
    for (const file of [tmpMp4, tmpWebp]) {
      try {
        if (fs.existsSync(file)) unlinkSync(file)
      } catch {}
    }
  }
}

function randomSticker(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function tryRandomSticker(conn, chat, list, quoted) {
  try {
    await sendMp4Sticker(conn, chat, randomSticker(list), quoted)
  } catch {}
}

const successStickers = [
  'https://files.evogb.win/LEqn4G.mp4',
  'https://project-sxl.vercel.app/files/c16fefa13a85.mp4',
  'https://project-sxl.vercel.app/files/07aa385ccb7a.mp4'
]

const errorStickers = [
  'https://files.evogb.win/Y8tiC9.mp4',
  'https://project-sxl.vercel.app/files/d390bde3699c.mp4',
  'https://project-sxl.vercel.app/files/6603fbc23dce.mp4'
]

function getErrorMessage(json, fallback = 'Error desconocido de la API.') {
  const candidates = [
    json?.message,
    json?.msg,
    json?.error?.message,
    json?.error,
    json?.result?.msg,
    json?.result?.message,
    json?.result?.error,
    json?.data?.msg,
    json?.data?.message
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return fallback
}

function getTikTokData(json) {
  if (!json || json.status !== true) return null

  const candidates = [
    json?.result?.data,
    json?.data,
    json?.result
  ]

  for (const data of candidates) {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (data.hdplay || data.play || data.wmplay || data.video || data.url) {
        return data
      }
    }
  }

  return null
}

function getTikTokVideo(data) {
  const candidates = [
    data?.hdplay,
    data?.play,
    data?.wmplay,
    data?.video,
    data?.video_url,
    data?.download,
    data?.url
  ]

  return candidates.find(value =>
    typeof value === 'string' && /^https?:\/\/\S+$/i.test(value)
  ) || null
}

async function apiRequest(url) {
  let response

  try {
    response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      signal: AbortSignal.timeout(60000)
    })
  } catch (e) {
    throw new Error(e?.name === 'TimeoutError'
      ? 'La API tardó demasiado en responder.'
      : e?.message || 'No se pudo conectar con la API.')
  }

  const raw = await response.text()
  let json

  try {
    json = JSON.parse(raw)
  } catch {
    throw new Error(`La API devolvió una respuesta inválida (HTTP ${response.status}).`)
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(json, `Error HTTP ${response.status}.`))
  }

  return json
}

async function downloadFromAPI(base, url, key = '') {
  const endpoint = `${base}/download/tiktok?url=${encodeURIComponent(url)}${key ? `&apikey=${encodeURIComponent(key)}` : ''}`
  const json = await apiRequest(endpoint)
  const data = getTikTokData(json)

  if (!data) {
    throw new Error(getErrorMessage(json, 'La API no devolvió información válida del video.'))
  }

  const video = getTikTokVideo(data)

  if (!video) {
    throw new Error(getErrorMessage(json, 'La API no devolvió un enlace de video válido.'))
  }

  return {
    video,
    title: typeof data.title === 'string' && data.title.trim()
      ? data.title.trim()
      : 'Sin título'
  }
}

async function downloadTikTok(url) {
  const errors = []

  if (api?.url) {
    try {
      return await downloadFromAPI(api.url, url, api.key)
    } catch (e) {
      errors.push(`API principal: ${e?.message || 'Error desconocido'}`)
    }
  }

  try {
    return await downloadFromAPI(FALLBACK_API, url)
  } catch (e) {
    errors.push(`API alternativa: ${e?.message || 'Error desconocido'}`)
  }

  throw new Error(errors.join('\n'))
}

async function searchTikTok(query) {
  if (!api?.url || !api?.key) {
    throw new Error('La búsqueda necesita la API principal configurada.')
  }

  const endpoint = `${api.url}/search/tiktok?q=${encodeURIComponent(query)}&apikey=${encodeURIComponent(api.key)}`
  const json = await apiRequest(endpoint)

  if (json?.status !== true) {
    throw new Error(getErrorMessage(json, 'No se pudo realizar la búsqueda en TikTok.'))
  }

  const candidates = [
    json?.result?.data,
    json?.result,
    json?.data
  ]

  let results = candidates.find(Array.isArray)

  if (!results && json?.result?.data && typeof json.result.data === 'object') {
    results = [json.result.data]
  }

  if (!results?.length) {
    throw new Error(getErrorMessage(json, 'No se encontraron videos.'))
  }

  const first = results[0]

  if (typeof first === 'string' && isTikTokUrl(first)) return first
  if (first?.url && isTikTokUrl(first.url)) return first.url

  const author = first?.author?.unique_id ||
    first?.author?.uniqueId ||
    first?.unique_id

  const id = first?.video_id || first?.id

  if (!author || !id) {
    throw new Error('La búsqueda no devolvió un enlace válido de TikTok.')
  }

  return `https://www.tiktok.com/@${author}/video/${id}`
}

const handler = async (m, { conn, args }) => {
  if (!args?.length) {
    return conn.reply(m.chat, '《✧》 Ingresa un enlace o una búsqueda.', m)
  }

  await conn.sendMessage(m.chat, {
    react: { text: '⏳', key: m.key }
  }).catch(() => {})

  let fkontak = m

  try {
    let thumb

    try {
      const pp = await conn.profilePictureUrl(m.sender, 'image')
      const buf = await axios.get(pp, {
        responseType: 'arraybuffer',
        timeout: 15000
      })
      thumb = Buffer.from(buf.data)
    } catch {
      try {
        thumb = fs.readFileSync('./src/logo.jpg')
      } catch {}
    }

    if (thumb) {
      fkontak = {
        key: {
          fromMe: false,
          participant: '0@s.whatsapp.net'
        },
        message: {
          contactMessage: {
            displayName: m.pushName || 'Usuario',
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName || 'Usuario'};;;\nFN:${m.pushName || 'Usuario'}\nitem1.TEL;waid=${String(m.sender).replace(/[^0-9]/g, '')}:${m.sender}\nitem1.X-ABLabel:Cel\nEND:VCARD`,
            jpegThumbnail: thumb
          }
        }
      }
    }
  } catch {
    fkontak = m
  }

  try {
    const query = args.join(' ').trim()

    if (!query) {
      throw new Error('Ingresa un enlace o una búsqueda.')
    }

    let url

    if (isUrl(query)) {
      if (!isTikTokUrl(query)) {
        throw new Error('El enlace no pertenece a TikTok.')
      }

      url = query

      if (/^(vt|vm)\.tiktok\.com$/i.test(new URL(url).hostname)) {
        url = await resolveTikTokUrl(url)
      }
    } else {
      url = await searchTikTok(query)
    }

    const result = await downloadTikTok(url)

    await conn.sendFile(
      m.chat,
      result.video,
      'tiktok.mp4',
      `✿ Aquí tienes.\n\n📝 ${result.title}`,
      m
    )

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    }).catch(() => {})

    await tryRandomSticker(conn, m.chat, successStickers, fkontak)

  } catch (e) {
    const error = typeof e?.message === 'string' && e.message.trim()
      ? e.message.trim()
      : 'Error desconocido al procesar el video.'

    await conn.reply(
      m.chat,
      `❏ Error.\n❏ Detalles: ${error}`,
      m
    ).catch(() => {})

    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    }).catch(() => {})

    await tryRandomSticker(conn, m.chat, errorStickers, fkontak)
  }
}

handler.command = ['tiktok', 'tt']
handler.help = ['tiktok']
handler.tags = ['descargas']
handler.group = true

export default handler
