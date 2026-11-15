import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const TMP_DIR = path.join(process.cwd(), 'tmp')
const MAX_SIZE = 1024 * 1024 * 1024
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

function parseFileSize(size) {
  if (!size) return 0
  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
  const match = String(size).trim().match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)
  if (!match) return 0
  return Math.round(parseFloat(match[1]) * units[match[2].toUpperCase()])
}

async function mediafire(url) {
  if (!url) throw new Error('URL requerida')

  let data
  try {
    const r = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    data = r.data
  } catch (e) {
    throw new Error(`No se pudo conectar a MediaFire: ${e.message}`)
  }

  if (!data || typeof data !== 'string') throw new Error('MediaFire no devolvió HTML válido')

  const $ = cheerio.load(data)
  const link1 = ($('#downloadButton').attr('href') || '').trim()
  const link2 = ($('#download_link > a.retry').attr('href') || '').trim()

  if (!link1 && !link2) throw new Error('No se encontró link de descarga (¿archivo eliminado o link inválido?)')

  const $intro = $('div.dl-info > div.intro')
  const filenameRaw = $intro.find('div.filename').text() || ''
  const filetypeRaw = $intro.find('div.filetype > span').eq(0).text() || ''
  const extSource = $intro.find('div.filetype > span').eq(1).text() || ''

  const extMatch = /\(\.(.*?)\)/.exec(String(extSource))
  const ext = (extMatch?.[1] || 'bin').trim().toLowerCase() || 'bin'
  const filename = String(filenameRaw).trim() || `mediafire_${Date.now()}`

  const $li = $('div.dl-info > ul.details > li')
  const aploud = String($li.eq(1).find('span').text() || '').trim() || 'Desconocido'
  const size = String($li.eq(0).find('span').text() || '').trim() || 'Desconocido'
  const sizeB = parseFileSize(size)

  return { filename, url: link1 || link2, type: String(filetypeRaw).trim() || 'Archivo', ext, aploud, size, sizeB }
}

async function downloadToDisk(url, filename) {
  const safe = String(filename || `mediafire_${Date.now()}`).replace(/[^\w.\-]/g, '_')
  const destino = path.join(TMP_DIR, `${Date.now()}_${safe}`)

  const res = await axios.get(url, {
    responseType: 'stream',
    timeout: 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: { 'User-Agent': UA, 'Accept': '*/*' }
  })

  if (!res.data) throw new Error('MediaFire no devolvió contenido para descargar')

  await pipeline(res.data, fs.createWriteStream(destino))

  const st = fs.statSync(destino)
  if (st.size === 0) {
    try { fs.unlinkSync(destino) } catch {}
    throw new Error('El archivo descargado está vacío (link expirado o bloqueado)')
  }

  return destino
}

function nombreFinal(filename, ext) {
  const base = String(filename || 'archivo').trim()
  const e = String(ext || '').trim()
  if (!e) return base
  if (base.toLowerCase().endsWith(`.${e.toLowerCase()}`)) return base
  return `${base}.${e}`
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📥 𝐌𝐄𝐃𝐈𝐀𝐅𝐈𝐑𝐄 📥╮
┃֪࣪
├ׁ̟̇❍✎ Ingresa un link de MediaFire
├ׁ̟̇❍✎ para descargar el archivo
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(), m)
  }

  let rutaLocal = null

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const res = await mediafire(args[0])

    if (res.sizeB > MAX_SIZE) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
      return conn.reply(m.chat, `✿ El archivo pesa *${res.size}* y supera el límite de *1 GB*.`, m)
    }

    const finalName = nombreFinal(res.filename, res.ext)

    await conn.sendMessage(m.chat, {
      image: { url: 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg' },
      caption: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${res.size}
├ׁ̟̇❍✎ Subido » ${res.aploud}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })
    rutaLocal = await downloadToDisk(res.url, finalName)

    await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } })
    await conn.sendFile(m.chat, rutaLocal, finalName, '', m)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    await conn.reply(m.chat, `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐄𝐑𝐑𝐎𝐑 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No se pudo descargar el archivo
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(), m)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  } finally {
    if (rutaLocal && fs.existsSync(rutaLocal)) {
      try { fs.unlinkSync(rutaLocal) } catch {}
    }
  }
}

handler.command = ['mediafire', 'mf']
handler.tags = ['descargas']
handler.help = ['mediafire']
handler.group = true

export default handler