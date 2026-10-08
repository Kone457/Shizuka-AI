import axios from 'axios'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { writeFileSync, unlinkSync } from 'fs'
import { execFile } from 'child_process'

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
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    return res.request?.res?.responseUrl || url
  } catch {
    return url
  }
}

const mp4ToWebp = (input, output) => {
  return new Promise((resolve, reject) => {
    execFile(
      'ffmpeg',
      [
        '-i', input,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0',
        '-loop', '0',
        '-ss', '0',
        '-t', '6',
        '-preset', 'default',
        '-an',
        '-vsync', '0',
        output,
        '-y'
      ],
      (err) => {
        if (err) reject(err)
        else resolve(output)
      }
    )
  })
}

async function sendMp4Sticker(conn, chat, url, quoted) {
  const tmpMp4 = path.join(os.tmpdir(), `${Date.now()}.mp4`)
  const tmpWebp = path.join(os.tmpdir(), `${Date.now()}.webp`)

  const { data } = await axios.get(url, {
    responseType: 'arraybuffer'
  })

  writeFileSync(tmpMp4, Buffer.from(data))

  await mp4ToWebp(tmpMp4, tmpWebp)

  await conn.sendMessage(
    chat,
    { sticker: fs.readFileSync(tmpWebp) },
    { quoted }
  )

  unlinkSync(tmpMp4)
  unlinkSync(tmpWebp)
}

const handler = async (m, { conn, args }) => {
  if (!args.length) {
    return conn.reply(m.chat, '《✧》 Ingresa un enlace o una búsqueda.', m)
  }

  await conn.sendMessage(m.chat, {
    react: { text: '⏳', key: m.key }
  })

  let fkontak
  try {
    let thumb
    try {
      const pp = await conn.profilePictureUrl(m.sender, 'image')
      const buf = await axios.get(pp, { responseType: 'arraybuffer' })
      thumb = Buffer.from(buf.data)
    } catch {
      thumb = fs.readFileSync('./src/logo.jpg')
    }

    fkontak = {
      key: { fromMe: false, participant: '0@s.whatsapp.net' },
      message: {
        contactMessage: {
          displayName: m.pushName,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName};;;\nFN:${m.pushName}\nitem1.TEL;waid=${m.sender.replace(/[^0-9]/g, '')}:${m.sender}\nitem1.X-ABLabel:Cel\nEND:VCARD`,
          jpegThumbnail: thumb
        }
      }
    }
  } catch {
    fkontak = m
  }

  try {
    let video
    let text = '✿ Aquí tienes.'
    const query = args.join(' ')

    if (isUrl(query)) {
      if (!isTikTokUrl(query)) {
        throw new Error('El enlace no pertenece a TikTok.')
      }

      let url = query

      if (
        url.includes('vt.tiktok.com') ||
        url.includes('vm.tiktok.com')
      ) {
        url = await resolveTikTokUrl(url)
      }

      const res = await fetch(
        `${api.url}/download/tiktok?url=${encodeURIComponent(
          url
        )}&apikey=${api.key}`
      )

      const json = await res.json()

      if (!json.status || !json.result?.data) {
        throw new Error('No se pudo descargar el video.')
      }

      const data = json.result.data
      video = data.hdplay || data.play || data.wmplay
      text += `\n\n📝 ${data.title || 'Sin título'}`
    } else {
      const res = await fetch(
        `${api.url}/search/tiktok?q=${encodeURIComponent(
          query
        )}&apikey=${api.key}`
      )

      const json = await res.json()

      if (!json.status || !json.result?.length) {
        throw new Error('No se encontró ningún video.')
      }

      const first = json.result[0]

      const url = `https://www.tiktok.com/@${first.author.unique_id}/video/${first.video_id}`

      const dl = await fetch(
        `${api.url}/download/tiktok?url=${encodeURIComponent(
          url
        )}&apikey=${api.key}`
      )

      const data = await dl.json()

      if (!data.status || !data.result?.data) {
        throw new Error(
          'No se pudo descargar el resultado encontrado.'
        )
      }

      const result = data.result.data
      video = result.hdplay || result.play || result.wmplay
      text += `\n\n📝 ${result.title || 'Sin título'}`
    }

    if (!video) {
      throw new Error('No se pudo obtener el archivo de video.')
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

    try {
      await sendMp4Sticker(
        conn,
        m.chat,
        'https://files.evogb.win/LEqn4G.mp4',
        fkontak
      )
    } catch {
      await sendMp4Sticker(
        conn,
        m.chat,
        'https://files.evogb.win/Y8tiC9.mp4',
        fkontak
      )
    }
  } catch (e) {
    await conn.reply(
      m.chat,
      `❏ Error.\n❏ Detalles: ${e.message}`,
      m
    )

    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    })

    try {
      await sendMp4Sticker(
        conn,
        m.chat,
        'https://files.evogb.win/Y8tiC9.mp4',
        fkontak
      )
    } catch {}
  }
}

handler.command = ['tiktok', 'tt']
handler.help = ['tiktok <url|texto>']
handler.tags = ['descargas']
handler.group = true

export default handler