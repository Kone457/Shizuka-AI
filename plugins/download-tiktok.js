
import axios from 'axios'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { writeFileSync, unlinkSync } from 'fs'
import { exec } from 'child_process'

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
    exec(
      `ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0" -loop 0 -ss 0 -t 6 -preset default -an -vsync 0 "${output}" -y`,
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
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })
  writeFileSync(tmpMp4, Buffer.from(data))
  await mp4ToWebp(tmpMp4, tmpWebp)
  await conn.sendMessage(chat, { sticker: fs.readFileSync(tmpWebp) }, { quoted })
  unlinkSync(tmpMp4)
  unlinkSync(tmpWebp)
}

function randomSticker(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function tryRandomSticker(conn, chat, list, quoted) {
  const url = randomSticker(list)
  try {
    await sendMp4Sticker(conn, chat, url, quoted)
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

async function downloadTikTok(url) {
  try {
    const res = await fetch(`${api.url}/download/tiktok?url=${encodeURIComponent(url)}&apikey=${api.key}`)
    const json = await res.json()
    if (!res.ok || !json.status || !json.result?.data) throw new Error('API principal no disponible.')
    const data = json.result.data
    const video = data.hdplay || data.play || data.wmplay
    if (!video) throw new Error('Sin video en API principal.')
    return { video, title: data.title || 'Sin título' }
  } catch {
    const res = await fetch(`https://aquire-api.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`)
    const json = await res.json()
    if (!res.ok || !json.status || !json.result?.data) {
      throw new Error(json?.result?.msg || json?.message || 'Fallaron las APIs de descarga.')
    }
    const data = json.result.data
    const video = data.hdplay || data.play || data.wmplay
    if (!video) throw new Error('La API de reserva no devolvió un video.')
    return { video, title: data.title || 'Sin título' }
  }
}

const handler = async (m, { conn, args }) => {
  if (!args.length) {
    return conn.reply(m.chat, '《✧》 Ingresa un enlace o una búsqueda.', m)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

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
      if (!isTikTokUrl(query)) throw new Error('El enlace no pertenece a TikTok.')
      let url = query
      if (url.includes('vt.tiktok.com') || url.includes('vm.tiktok.com')) {
        url = await resolveTikTokUrl(url)
      }
      const result = await downloadTikTok(url)
      video = result.video
      text += `\n\n📝 ${result.title}`
    } else {
      const res = await fetch(`${api.url}/search/tiktok?q=${encodeURIComponent(query)}&apikey=${api.key}`)
      const json = await res.json()
      if (!json.status || !json.result?.length) throw new Error('No se encontró ningún video.')
      const first = json.result[0]
      const url = `https://www.tiktok.com/@${first.author.unique_id}/video/${first.video_id}`
      const result = await downloadTikTok(url)
      video = result.video
      text += `\n\n📝 ${result.title}`
    }

    if (!video) throw new Error('No se pudo obtener el archivo de video.')

    await conn.sendFile(m.chat, video, 'tiktok.mp4', text, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await tryRandomSticker(conn, m.chat, successStickers, fkontak)
  } catch (e) {
    await conn.reply(m.chat, `❏ Error.\n❏ Detalles: ${e.message || 'Error desconocido.'}`, m)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await tryRandomSticker(conn, m.chat, errorStickers, fkontak)
  }
}

handler.command = ['tiktok', 'tt']
handler.help = ['tiktok']
handler.tags = ['descargas']
handler.group = true

export default handler
