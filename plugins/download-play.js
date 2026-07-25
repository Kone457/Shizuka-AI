import fetch from 'node-fetch'
import axios from 'axios'
import fs from 'fs'

const isUrl = (text) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/i.test(text)
const MAX_BYTES = 50 * 1024 * 1024

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
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      contactMessage: {
        displayName: m.pushName || 'Usuario',
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName || 'Usuario'};;;\nFN:${m.pushName || 'Usuario'}\nitem1.TEL;waid=${(m.sender || '').replace(/[^0-9]/g,'')}:${m.sender || ''}\nitem1.X-ABLabel:Cel\nEND:VCARD`,
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
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    let size = parseInt(res.headers['content-length'] || '0', 10)
    
    if (!size || isNaN(size)) {
      const resGet = await axios.get(url, {
        headers: { Range: 'bytes=0-0', 'User-Agent': 'Mozilla/5.0' },
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

const handler = async (m, { conn, command, text }) => {
  const fkontak = await buildContact(m, conn)

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    return conn.sendMessage(m.chat, { text: 'Ingresa el nombre o link de YouTube.' }, { quoted: fkontak })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    if (isUrl(text)) {

      if (['play', 'mp3', 'ytmp3'].includes(command)) {
        const res = await fetch(`${api.url}/download/audio?url=${encodeURIComponent(text)}&apikey=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.result?.url) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return conn.sendMessage(m.chat, { text: 'No se pudo obtener el audio.' }, { quoted: fkontak })
        }
        const data = json.result
        const size = json.result.size || await getSize(data.url)
        if (size > MAX_BYTES) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return conn.sendMessage(m.chat, { text: `El archivo supera el límite establecido (${formatSize(size)}).` }, { quoted: fkontak })
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return conn.sendMessage(m.chat, {
          audio: { url: data.url },
          mimetype: 'audio/mpeg',
          fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`
        }, { quoted: fkontak })
      }

      if (['mp4', 'ytmp4', 'play2'].includes(command)) {
        const res = await fetch(`${api.url}/download/ytv2?url=${encodeURIComponent(text)}&apikey=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.result?.dl_url) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return conn.sendMessage(m.chat, { text: 'No se pudo obtener el video.' }, { quoted: fkontak })
        }
        const data = json.result
        const size = json.result.size || await getSize(data.dl_url)
        if (size > MAX_BYTES) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return conn.sendMessage(m.chat, { text: `El archivo supera el límite de 50 MB (${formatSize(size)}).` }, { quoted: fkontak })
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return conn.sendMessage(m.chat, {
          video: { url: data.dl_url },
          mimetype: 'video/mp4',
          fileName: `${(data.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`
        }, { quoted: fkontak })
      }

      const link = text
      const caption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ 🔗 Link:
├ׁ̟̇❍✎ ${link}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✰ Selecciona una opción
`.trim()

      const message = {
        caption,
        buttons: [
          { buttonId: `audio_${link}`, buttonText: { displayText: '❖ AUDIO' }, type: 1 },
          { buttonId: `video_${link}`, buttonText: { displayText: '❖ VIDEO' }, type: 1 }
        ],
        headerType: 4
      }

      await conn.sendMessage(m.chat, message, { quoted: fkontak })
      return
    }

    const res = await fetch(`${api.url}/search/youtube?q=${encodeURIComponent(text)}&apikey=${api.key}`)
    const json = await res.json()
    if (!json.status || !json.result?.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.sendMessage(m.chat, { text: 'No se encontró coincidencia, intenta otro nombre.' }, { quoted: fkontak })
    }

    const data = json.result[0]
    const link = data.link

    const caption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ ❖ ${data.title}
├ׁ̟̇❍✎ ✿ Canal: ${data.channel}
├ׁ̟̇❍✎ ⏱️ Duración: ${data.duration}
┃֪࣪
├ׁ̟̇❍✎ 🔗 Link:
├ׁ̟̇❍✎ ${link}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✰ Selecciona una opción
`.trim()

    let message = {
      caption,
      buttons: [
        { buttonId: `audio_${link}`, buttonText: { displayText: '❖ AUDIO' }, type: 1 },
        { buttonId: `video_${link}`, buttonText: { displayText: '❖ VIDEO' }, type: 1 }
      ],
      headerType: 4
    }

    if (data.imageUrl) {
      try {
        const thumb = await (await fetch(data.imageUrl)).buffer()
        message.image = thumb
      } catch {}
    }

    await conn.sendMessage(m.chat, message, { quoted: fkontak })

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    conn.sendMessage(m.chat, { text: 'Error inesperado, intenta nuevamente.' }, { quoted: fkontak })
  }
}

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId
  if (!id) return

  const fkontak = await buildContact(m, conn)

  try {
    if (id.startsWith('audio_')) {
      const link = id.replace('audio_', '')
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      const res = await fetch(`${api.url}/download/audio?url=${encodeURIComponent(link)}&apikey=${api.key}`)
      const json = await res.json()
      if (!json.status || !json.result?.url) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.sendMessage(m.chat, { text: 'No se pudo obtener el audio.' }, { quoted: fkontak })
      }
      const data = json.result
      const size = json.result.size || await getSize(data.url)
      if (size > MAX_BYTES) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.sendMessage(m.chat, { text: `El archivo supera el límite establecido (${formatSize(size)}).` }, { quoted: fkontak })
      }
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      return conn.sendMessage(m.chat, {
        audio: { url: data.url },
        mimetype: 'audio/mpeg',
        fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`
      }, { quoted: fkontak })
    }

    if (id.startsWith('video_')) {
      const link = id.replace('video_', '')
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      const res = await fetch(`${api.url}/download/ytv2?url=${encodeURIComponent(link)}&apikey=${api.key}`)
      const json = await res.json()
      if (!json.status || !json.result?.dl_url) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.sendMessage(m.chat, { text: 'No se pudo obtener el video.' }, { quoted: fkontak })
      }
      const data = json.result
      const size = json.result.size || await getSize(data.dl_url)
      if (size > MAX_BYTES) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.sendMessage(m.chat, { text: `El archivo supera el límite establecido (${formatSize(size)}).` }, { quoted: fkontak })
      }
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      return conn.sendMessage(m.chat, {
        video: { url: data.dl_url },
        mimetype: 'video/mp4',
        fileName: `${(data.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`
      }, { quoted: fkontak })
    }
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    conn.sendMessage(m.chat, { text: 'Error inesperado, intenta nuevamente.' }, { quoted: fkontak })
  }
}

handler.command = ['play', 'play2', 'mp3', 'mp4', 'ytmp3', 'ytmp4']
handler.tags = ['descargas']
handler.help = ['play']
handler.group = true

export default handler
