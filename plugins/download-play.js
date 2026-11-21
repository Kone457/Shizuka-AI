import fetch from 'node-fetch'
import axios from 'axios'
import fs from 'fs'
import yts from 'yt-search'
const isUrl = (text) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/i.test(text)
const MAX_BYTES = 50 * 1024 * 1024
const MAX_DURATION = 10 * 60
async function buildContact(m, conn) {
  let thumb = null
  try {
    const ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    if (ppUrl) {
      const res = await axios.get(ppUrl, { responseType: 'arraybuffer' })
      thumb = Buffer.from(res.data, 'binary')
    }
  } catch {
    try {
      thumb = fs.readFileSync('./src/logo.jpg')
    } catch {
      thumb = null
    }
  }
  return {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net'
    },
    message: {
      contactMessage: {
        displayName: m.pushName || 'مستخدم',
        vcard: `BEGIN:VCARD
VERSION:3.0
N:;${m.pushName || 'مستخدم'};;;
FN:${m.pushName || 'مستخدم'}
item1.TEL;waid=${(m.sender || '').replace(/[^0-9]/g, '')}:${m.sender || ''}
item1.X-ABLabel:Cel
END:VCARD`,
        jpegThumbnail: thumb || null
      }
    }
  }
}
async function getSize(url) {
  if (!url) return 0
  try {
    const res = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })
    let size = parseInt(res.headers['content-length'] || '0', 10)
    if (!size || isNaN(size)) {
      const resGet = await axios.get(url, {
        headers: {
          Range: 'bytes=0-0',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 5000,
        maxRedirects: 5
      })
      const contentRange = resGet.headers['content-range']
      if (contentRange) {
        size = parseInt(contentRange.split('/')[1] || '0', 10)
      }
    }
    return isNaN(size) ? 0 : size
  } catch {
    return 0
  }
}
function formatSize(bytes) {
  if (!bytes || bytes <= 0) return 'غير معروف'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) {
    const gb = mb / 1024
    return `${gb.toFixed(2)} GB`
  }
  return `${mb.toFixed(2)} MB`
}
function getDurationSeconds(value) {
  if (typeof value === 'number') return value
  if (!value) return 0
  if (typeof value === 'string') {
    if (/^\d+$/.test(value)) return Number(value)
    const parts = value.split(':').map(Number)
    if (parts.some(isNaN)) return 0
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 1) return parts[0]
  }
  return 0
}
async function downloadWithApi(link, isAudio) {
  const fallbackUrl = isAudio
    ? `${api.url3}/faa/ytmp3?url=${encodeURIComponent(link)}`
    : `${api.url3}/faa/ytmp4?url=${encodeURIComponent(link)}`
  try {
    const fallbackRes = await fetch(fallbackUrl)
    if (fallbackRes.ok) {
      const fallbackJson = await fallbackRes.json()
      if (fallbackJson.status && fallbackJson.result) {
        const result = fallbackJson.result
        const downloadUrl = isAudio ? result.mp3 : result.download_url
        if (downloadUrl) {
          return {
            data: {
              title: result.title,
              thumbnail: result.thumbnail,
              duration: result.duration,
              download: downloadUrl
            },
            downloadUrl
          }
        }
      }
    }
  } catch {}
  try {
    const res = await fetch(`${api.url}/download/audio?url=${encodeURIComponent(link)}&apikey=${api.key}`)
    if (res.ok) {
      const json = await res.json()
      if (json.status && json.result?.url) {
        return {
          data: {
            title: json.result.info?.title,
            thumbnail: json.result.info?.thumbnail,
            duration: json.result.info?.duration,
            download: json.result.url
          },
          downloadUrl: json.result.url
        }
      }
    }
  } catch {}
  const endpoint = isAudio
    ? `${api.url2}/download/ytmp3`
    : `${api.url2}/download/ytmp4`
  const downloadApiUrl = isAudio
    ? `${endpoint}?url=${encodeURIComponent(link)}`
    : `${endpoint}?url=${encodeURIComponent(link)}&format=360p`
  const res = await fetch(downloadApiUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (!json.status || !json.data?.download) throw new Error('API failed')
  return {
    data: json.data,
    downloadUrl: json.data.download
  }
}
const PENDING_TTL = 5 * 60 * 1000
export const playSessions = new Map()
const pending = playSessions
const pendingKey = (m) => `${m.chat}|${m.sender}`

const AUDIO_CMDS = new Set(['mp3', 'ytmp3', 'صوت', 'يوت_صوت', 'اغنية', 'يوت_اغنيه'])
const VIDEO_CMDS = new Set(['mp4', 'ytmp4', 'فيديو', 'يوت_فيديو'])

export function parseChoice(text) {
  const raw = String(text || '').trim().replace(/^[./!#]/, '')
  const match = raw.match(/^(?:([12])|(صوت|فيديو)(?:\s*(\d+))?)$/i)
  if (!match) return null
  return {
    isAudio: match[1] ? match[1] === '1' : match[2] === 'صوت',
    idx: match[3] ? Number(match[3]) : 1
  }
}

async function downloadAndSend({ m, conn, fkontak, item, isAudio }) {
  const { data, downloadUrl } = await downloadWithApi(item.url, isAudio)
  const apiDuration = getDurationSeconds(
    data.seconds || data.duration || data.length || data.duration_seconds || data.timestamp
  )
  if (apiDuration && apiDuration > MAX_DURATION) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: 'الملف عدّى الحد المسموح.' }, { quoted: fkontak })
  }
  const size = await getSize(downloadUrl)
  if (size > MAX_BYTES) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(
      m.chat,
      { text: `الملف عدّى الحد المسموح (${formatSize(size)}).` },
      { quoted: fkontak }
    )
  }
  const cleanTitle = (data.title || item.title || 'media').replace(/[^\w\s-]/gi, '').trim()
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  if (isAudio) {
    return conn.sendMessage(
      m.chat,
      {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${cleanTitle || 'audio'}.mp3`
      },
      { quoted: fkontak }
    )
  }
  return conn.sendMessage(
    m.chat,
    {
      video: { url: downloadUrl },
      mimetype: 'video/mp4',
      fileName: `${cleanTitle || 'video'}.mp4`
    },
    { quoted: fkontak }
  )
}

export function buildSearchText(query, results, m) {
  const list = results
    .map((v, i) => `├❍ ${i + 1}. *${v.title}*\n├❍    ⏱️ ${v.timestamp || '؟'} · 👤 ${v.author?.name || '؟'}`)
    .join('\n')
  return `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
├❍ 🔎 *نتائج البحث:* ${query}
├❍
${list}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

@${String(m.sender).split('@')[0]} عايز تنزّل إيه؟
1️⃣ *صوت* — mp3
2️⃣ *فيديو* — mp4

> عايز نتيجة تانية؟ اكتب *صوت 3* أو *فيديو 2*`
}

const handler = async (m, { conn, command, text }) => {
  const fkontak = await buildContact(m, conn)
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    return conn.sendMessage(m.chat, { text: 'اكتب اسم أو لينك يوتيوب.' }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const forced = AUDIO_CMDS.has(command) ? true : VIDEO_CMDS.has(command) ? false : null

    if (isUrl(text)) {
      let video = null
      try {
        const search = await yts(text)
        video = search.videos?.find(item => item.url === text) || search.videos?.[0] || null
      } catch {}
      const seconds = getDurationSeconds(video?.seconds || video?.timestamp)
      if (!video || !seconds || seconds > MAX_DURATION) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.sendMessage(m.chat, { text: 'الملف عدّى الحد المسموح.' }, { quoted: fkontak })
      }
      return downloadAndSend({ m, conn, fkontak, item: video, isAudio: forced !== null ? forced : true })
    }

    const search = await yts(text)
    const results = (search.videos || [])
      .filter(video => {
        const seconds = getDurationSeconds(video.seconds || video.timestamp)
        return seconds > 0 && seconds <= MAX_DURATION
      })
      .slice(0, 5)

    if (!results.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.sendMessage(m.chat, { text: 'مفيش نتائج، جرّب اسم تاني.' }, { quoted: fkontak })
    }

    if (forced !== null) {
      return downloadAndSend({ m, conn, fkontak, item: results[0], isAudio: forced })
    }

    pending.set(pendingKey(m), { results, at: Date.now() })

    const caption = buildSearchText(text, results, m)
    let sent = false
    if (results[0].thumbnail) {
      try {
        const thumbRes = await fetch(results[0].thumbnail)
        const thumb = await thumbRes.buffer()
        await conn.sendMessage(m.chat, { image: thumb, caption, mentions: [m.sender] }, { quoted: m })
        sent = true
      } catch {}
    }
    if (!sent) {
      await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m })
    }
    await conn.sendMessage(m.chat, { react: { text: '❔', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: 'خطأ غير متوقع، جرّب تاني.' }, { quoted: m })
  }
}

handler.before = async (m, { conn }) => {
  const key = pendingKey(m)
  const session = pending.get(key)
  if (!session) return false
  if (Date.now() - session.at > PENDING_TTL) {
    pending.delete(key)
    return false
  }

  const choice = parseChoice(m.text)
  if (!choice) return false

  const { isAudio, idx } = choice
  const item = session.results[idx - 1]
  if (!item) {
    await conn.sendMessage(
      m.chat,
      { text: `مفيش نتيجة رقم ${idx} — اختار من 1 لـ ${session.results.length}` },
      { quoted: m }
    )
    return true
  }

  pending.delete(key)
  const fkontak = await buildContact(m, conn)
  try {
    await downloadAndSend({ m, conn, fkontak, item, isAudio })
  } catch {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: 'فشل التحميل، جرّب تاني.' }, { quoted: m })
  }
  return true
}

handler.command = ['play', 'play2', 'mp3', 'mp4', 'ytmp3', 'ytmp4', 'يوتيوب', 'صوت', 'فيديو', 'يوت_صوت', 'يوت_فيديو', 'يوت_اغنيه', 'اغنيه']
handler.tags = ['descargas']
handler.help = ['يوتيوب']
handler.group = true

export default handler
