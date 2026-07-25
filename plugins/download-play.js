import fetch from 'node-fetch'
import axios from 'axios'
import fs from 'fs'

const isUrl = (text) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/i.test(text)

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

const handler = async (m, { conn, command, text }) => {
  const fkontak = await buildContact(m, conn)

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    return conn.sendMessage(m.chat, { text: 'Ingresa el nombre o link de YouTube.' }, { quoted: fkontak })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    if (isUrl(text)) {
      if (command === 'play' || command === 'mp3' || command === 'ytmp3') {
        const res = await fetch(`${api.url}/download/audio?url=${encodeURIComponent(text)}&apikey=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.result?.url) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return conn.sendMessage(m.chat, { text: 'No se pudo obtener el audio.' }, { quoted: fkontak })
        }
        const data = json.result
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        await conn.sendMessage(m.chat, {
          audio: { url: data.url },
          mimetype: 'audio/mpeg',
          fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`
        }, { quoted: fkontak })
      }

      if (command === 'mp4' || command === 'ytmp4' || command === 'play2') {
        const res = await fetch(`${api.url}/download/ytv2?url=${encodeURIComponent(text)}&apikey=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.result?.dl_url) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return conn.sendMessage(m.chat, { text: 'No se pudo obtener el video.' }, { quoted: fkontak })
        }
        const data = json.result
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        await conn.sendMessage(m.chat, {
          video: { url: data.dl_url },
          mimetype: 'video/mp4',
          fileName: `${(data.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`
        }, { quoted: fkontak })
      }

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
      const thumb = await (await fetch(data.imageUrl)).buffer()
      message.image = thumb
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
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      await conn.sendMessage(m.chat, {
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
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      await conn.sendMessage(m.chat, {
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