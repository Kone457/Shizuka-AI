
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
const processed = new Set()

let handler = async (m, { conn }) => {
  const messageId = m.key?.id
  if (!m.quoted || !messageId || processed.has(messageId)) return

  processed.add(messageId)
  const timer = setTimeout(() => processed.delete(messageId), 60000)
  timer.unref?.()

  const q = m.quoted
  const mime = q.mimetype || q.msg?.mimetype || ''

  if (!mime) return

  try {
    const media = await q.download()
    if (!Buffer.isBuffer(media) || !media.length) return

    const type = await fileTypeFromBuffer(media)
    const ext = type?.ext || 'bin'
    const mimetype = type?.mime || mime

    const results = await Promise.allSettled([
      catbox(media, ext),
      litterbox(media, ext),
      puticu(media, mimetype),
      uguu(media, ext),
      quax(media, ext),
      evogb(media, ext, mimetype)
    ])

    const names = ['Catbox', 'Litterbox', 'Put.icu', 'Uguu', 'Qu.ax', 'Evogb']
    const successful = results.filter(r => r.status === 'fulfilled').length

    if (!successful) throw new Error('Todos los servidores rechazaron la subida.')

    const links = results.map((result, i) => {
      if (result.status === 'fulfilled') {
        return `✅ *${names[i]}*\n${result.value}`
      }
      console.error(`${names[i]}:`, result.reason?.message || result.reason)
      return `❌ *${names[i]}*\nNo disponible`
    })

    let txt = `*乂 T O U R L 乂*\n\n`
    txt += `📦 *Archivo:* ${Date.now()}.${ext}\n`
    txt += `📏 *Tamaño:* ${formatBytes(media.length)}\n`
    txt += `🌐 *Servidores:* ${successful}/${results.length}\n\n`
    txt += links.join('\n\n')

    await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `❌ Error al subir el archivo.\n${e.message}`
    }, { quoted: m })
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = ['tourl']

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
  if (!res.ok || !isURL(data)) throw new Error('Catbox: respuesta inválida')
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
  if (!res.ok || !isURL(data)) throw new Error('Litterbox: respuesta inválida')
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

  if (!res.ok || !url || !isURL(url)) throw new Error('Put.icu: respuesta inválida')
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

  if (!res.ok || !url || !isURL(url)) throw new Error('Uguu: respuesta inválida')
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

  if (!res.ok || !url || !isURL(url)) throw new Error('Qu.ax: respuesta inválida')
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

  if (!res.ok) throw new Error('Evogb: error HTTP')

  const json = await res.json()
  const url = json?.url || json?.link

  if (!url || !isURL(url)) throw new Error('Evogb: respuesta inválida')
  return url
}
