
import fetch from 'node-fetch'
import crypto from 'crypto'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return conn.reply(m.chat, '📦 من فضلك رد على ملف صحيح (صورة، فيديو، إلخ).', m)

  try {
    let media = await q.download()
    let type = await fileTypeFromBuffer(media)
    let ext = type?.ext || 'bin'
    let mimetype = type?.mime || mime

    let results = await Promise.allSettled([
      catbox(media, ext),
      litterbox(media, ext),
      puticu(media, mimetype),
      uguu(media, ext),
      quax(media, ext),
      evogb(media, ext, mimetype)
    ])

    let names = ['Catbox', 'Litterbox', 'Put.icu', 'Uguu', 'Qu.ax', 'Evogb']
    let links = results.map((result, i) => {
      if (result.status === 'fulfilled') {
        return `✅ *${names[i]}*\n${result.value}`
      }
      return `❌ *${names[i]}*\nغير متاح`
    })

    let successful = results.filter(r => r.status === 'fulfilled').length
    if (!successful) throw new Error('كل السيرفرات رفضت الرفع.')

    let txt = `*乂 T O U R L 乂*\n\n`
    txt += `📦 *الملف:* ${Date.now()}.${ext}\n`
    txt += `📏 *الحجم:* ${formatBytes(media.length)}\n`
    txt += `🌐 *Servidores:* ${successful}/${results.length}\n\n`
    txt += links.join('\n\n')

    await conn.reply(m.chat, txt, m)
  } catch (e) {
    console.error(e)
    await m.reply(`❌ خطأ في رفع الملف.\n${e.message}`)
  }
}

handler.help = ['رفع']
handler.tags = ['tools']
handler.command = ['tourl', 'رفع']

export default handler

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

function bufToBlob(buffer, mime = 'application/octet-stream') {
  return new Blob([buffer], { type: mime })
}

function isURL(text) {
  try {
    const url = new URL(text)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function catbox(buffer, ext = 'jpg') {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', bufToBlob(buffer), `${Date.now()}.${ext}`)

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    headers: {
      Origin: 'https://catbox.moe',
      Referer: 'https://catbox.moe/',
      'User-Agent': UA
    },
    body: form
  })

  const data = (await res.text()).trim()
  if (!res.ok || !isURL(data)) throw new Error('Catbox: رد غير صحيح')
  return data
}

async function litterbox(buffer, ext = 'jpg') {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('time', '72h')
  form.append('fileToUpload', bufToBlob(buffer), `${Date.now()}.${ext}`)

  const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
    method: 'POST',
    headers: {
      Origin: 'https://litterbox.catbox.moe',
      Referer: 'https://litterbox.catbox.moe/',
      'User-Agent': UA
    },
    body: form
  })

  const data = (await res.text()).trim()
  if (!res.ok || !isURL(data)) throw new Error('Litterbox: رد غير صحيح')
  return data
}

async function puticu(buffer, mime = 'application/octet-stream') {
  const res = await fetch('https://put.icu/upload/', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': mime
    },
    body: buffer
  })

  const json = await res.json()
  const url = json?.direct_url || json?.url
  if (!res.ok || !url || !isURL(url)) throw new Error('Put.icu: رد غير صحيح')
  return url.trim()
}

async function uguu(buffer, ext = 'jpg') {
  const form = new FormData()
  form.append('files[]', bufToBlob(buffer), `${Date.now()}.${ext}`)

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    headers: {
      Origin: 'https://uguu.se',
      Referer: 'https://uguu.se/',
      'User-Agent': UA
    },
    body: form
  })

  const json = await res.json()
  const url = json?.files?.[0]?.url
  if (!res.ok || !url || !isURL(url)) throw new Error('Uguu: رد غير صحيح')
  return url.trim()
}

async function quax(buffer, ext = 'jpg') {
  const form = new FormData()
  form.append('files[]', bufToBlob(buffer), `${Date.now()}.${ext}`)

  const res = await fetch('https://qu.ax/upload.php', {
    method: 'POST',
    headers: {
      Origin: 'https://qu.ax',
      Referer: 'https://qu.ax/',
      'User-Agent': UA
    },
    body: form
  })

  const json = await res.json()
  const url = json?.files?.[0]?.url
  if (!res.ok || !url || !isURL(url)) throw new Error('Qu.ax: رد غير صحيح')
  return url
}

async function evogb(buffer, ext = 'bin', mime = 'application/octet-stream') {
  const fileName = `${crypto.randomBytes(5).toString('hex')}.${ext}`
  const form = new FormData()
  form.append('file', bufToBlob(buffer, mime), fileName)

  const res = await fetch('https://evogb.win/api/upload', {
    method: 'POST',
    body: form
  })

  if (!res.ok) throw new Error('Evogb: خطأ HTTP')
  const json = await res.json()
  const url = json?.url || json?.link

  if (!url || !isURL(url)) throw new Error('Evogb: رد غير صحيح')
  return url
}
