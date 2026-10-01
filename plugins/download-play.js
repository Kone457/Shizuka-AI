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
        displayName: m.pushName || 'Usuario',
        vcard: `BEGIN:VCARD
VERSION:3.0
N:;${m.pushName || 'Usuario'};;;
FN:${m.pushName || 'Usuario'}
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
  if (!bytes || bytes <= 0) return 'Desconocido'
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
const handler = async (m, { conn, command, text }) => {
  const fkontak = await buildContact(m, conn)
  if (!text) {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⚠️',
        key: m.key
      }
    })
    return conn.sendMessage(
      m.chat,
      {
        text: 'Ingresa el nombre o link de YouTube.'
      },
      {
        quoted: fkontak
      }
    )
  }
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })
    let link = text
    let selectedItem = null
    if (!isUrl(text)) {
      const search = await yts(text)
      if (!search.videos?.length) {
        await conn.sendMessage(m.chat, {
          react: {
            text: '❌',
            key: m.key
          }
        })
        return conn.sendMessage(
          m.chat,
          {
            text: 'No se encontró coincidencia, intenta otro nombre.'
          },
          {
            quoted: fkontak
          }
        )
      }
      selectedItem = search.videos.find(video => {
        const seconds = getDurationSeconds(video.seconds || video.timestamp)
        return seconds > 0 && seconds <= MAX_DURATION
      })
      if (!selectedItem) {
        await conn.sendMessage(m.chat, {
          react: {
            text: '❌',
            key: m.key
          }
        })
        return conn.sendMessage(
          m.chat,
          {
            text: 'El archivo supera el límite establecido.'
          },
          {
            quoted: fkontak
          }
        )
      }
      link = selectedItem.url
      const caption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ☁️╮
├ׁ̟̇❍✎ ❖ ${selectedItem.title || 'YouTube Content'}
├ׁ̟̇❍✎ ✿ Canal: ${selectedItem.author?.name || 'Desconocido'}
├ׁ̟̇❍✎ ⏱️ Duración: ${selectedItem.timestamp || 'Desconocido'}
├ׁ̟̇❍✎ 🔗 Link:
├ׁ̟̇❍✎ ${link}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
      if (selectedItem.thumbnail) {
        try {
          const thumbRes = await fetch(selectedItem.thumbnail)
          const thumb = await thumbRes.buffer()
          await conn.sendMessage(
            m.chat,
            {
              image: thumb,
              caption
            },
            {
              quoted: fkontak
            }
          )
        } catch {
          await conn.sendMessage(
            m.chat,
            {
              text: caption
            },
            {
              quoted: fkontak
            }
          )
        }
      } else {
        await conn.sendMessage(
          m.chat,
          {
            text: caption
          },
          {
            quoted: fkontak
          }
        )
      }
    } else {
      try {
        const search = await yts(text)
        const video = search.videos?.find(item => item.url === text) || search.videos?.[0]
        if (!video) {
          await conn.sendMessage(m.chat, {
            react: {
              text: '❌',
              key: m.key
            }
          })
          return conn.sendMessage(
            m.chat,
            {
              text: 'El archivo supera el límite establecido.'
            },
            {
              quoted: fkontak
            }
          )
        }
        const seconds = getDurationSeconds(video.seconds || video.timestamp)
        if (!seconds || seconds > MAX_DURATION) {
          await conn.sendMessage(m.chat, {
            react: {
              text: '❌',
              key: m.key
            }
          })
          return conn.sendMessage(
            m.chat,
            {
              text: 'El archivo supera el límite establecido.'
            },
            {
              quoted: fkontak
            }
          )
        }
        selectedItem = video
      } catch {
        await conn.sendMessage(m.chat, {
          react: {
            text: '❌',
            key: m.key
          }
        })
        return conn.sendMessage(
          m.chat,
          {
            text: 'El archivo supera el límite establecido.'
          },
          {
            quoted: fkontak
          }
        )
      }
    }
    const isAudio = ['play', 'mp3', 'ytmp3'].includes(command)
    const endpoint = isAudio
      ? `${api.url2}/download/ytmp3`
      : `${api.url2}/download/ytmp4`
    const downloadApiUrl = isAudio
      ? `${endpoint}?url=${encodeURIComponent(link)}`
      : `${endpoint}?url=${encodeURIComponent(link)}&format=360p`
    const res = await fetch(downloadApiUrl)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const json = await res.json()
    if (!json.status || !json.data?.download) {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      })
      return conn.sendMessage(
        m.chat,
        {
          text: `No se pudo obtener el ${isAudio ? 'audio' : 'video'}.`
        },
        {
          quoted: fkontak
        }
      )
    }
    const data = json.data
    const apiDuration = getDurationSeconds(
      data.seconds ||
      data.duration ||
      data.length ||
      data.duration_seconds ||
      data.timestamp
    )
    if (apiDuration && apiDuration > MAX_DURATION) {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      })
      return conn.sendMessage(
        m.chat,
        {
          text: 'El archivo supera el límite establecido.'
        },
        {
          quoted: fkontak
        }
      )
    }
    const downloadUrl = data.download
    const size = await getSize(downloadUrl)
    if (size > MAX_BYTES) {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      })
      return conn.sendMessage(
        m.chat,
        {
          text: `El archivo supera el límite establecido (${formatSize(size)}).`
        },
        {
          quoted: fkontak
        }
      )
    }
    const cleanTitle = (data.title || selectedItem?.title || 'descarga')
      .replace(/[^\w\s-]/gi, '')
      .trim()
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })
    if (isAudio) {
      return conn.sendMessage(
        m.chat,
        {
          audio: {
            url: downloadUrl
          },
          mimetype: 'audio/mpeg',
          fileName: `${cleanTitle || 'audio'}.mp3`
        },
        {
          quoted: fkontak
        }
      )
    }
    return conn.sendMessage(
      m.chat,
      {
        video: {
          url: downloadUrl
        },
        mimetype: 'video/mp4',
        fileName: `${cleanTitle || 'video'}.mp4`
      },
      {
        quoted: fkontak
      }
    )
  } catch (e) {
    await conn.sendMessage(m.chat, {
      react: {
        text: '❌',
        key: m.key
      }
    })
    return conn.sendMessage(
      m.chat,
      {
        text: 'Error inesperado, intenta nuevamente.'
      },
      {
        quoted: fkontak
      }
    )
  }
}
handler.command = [
  'play',
  'play2',
  'mp3',
  'mp4',
  'ytmp3',
  'ytmp4'
]
handler.tags = ['descargas']
handler.help = ['play']
handler.group = true
export default handler