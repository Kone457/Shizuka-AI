import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'

function parseFileSize(size) {
  if (!size) return 0

  const units = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4
  }

  const match = size.toString().trim().match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)

  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  return Math.round(value * units[unit])
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )

  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 2)} ${units[i]}`
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--'

  seconds = Math.floor(seconds)

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`

  return `${s}s`
}

function progressBar(percent, length = 18) {
  const value = Math.max(0, Math.min(100, percent))
  const filled = Math.round((value / 100) * length)

  return '▰'.repeat(filled) + '▱'.repeat(length - filled)
}

async function mediafire(url) {
  if (!url) throw new Error('URL requerida')

  const { data } = await axios.get(url, {
    timeout: 20000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  const $ = cheerio.load(data)

  const link1 = ($('#downloadButton').attr('href') || '').trim()
  const link2 = ($('#download_link > a.retry').attr('href') || '').trim()

  const $intro = $('div.dl-info > div.intro')

  const filename =
    $intro.find('div.filename').text().trim() || 'archivo'

  const filetype =
    $intro.find('div.filetype > span').eq(0).text().trim() ||
    'Archivo'

  const extMatch = /\(\.(.*?)\)/.exec(
    $intro.find('div.filetype > span').eq(1).text()
  )

  const ext = extMatch?.[1]?.trim() || 'bin'

  const $li = $('div.dl-info > ul.details > li')

  const aploud =
    $li.eq(1).find('span').text().trim() || 'Desconocido'

  const size =
    $li.eq(0).find('span').text().trim() || 'Desconocido'

  const sizeB = parseFileSize(size)

  if (!link1 && !link2) {
    throw new Error('No se pudo obtener el enlace de descarga')
  }

  return {
    filename,
    url: link1 || link2,
    type: filetype,
    ext,
    aploud,
    size,
    sizeB
  }
}

function cleanFilename(name) {
  return String(name || 'archivo')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim()
    .slice(0, 180) || 'archivo'
}

async function editCaption(conn, chat, key, caption) {
  try {
    await conn.sendMessage(
      chat,
      {
        caption,
        edit: key
      }
    )

    return true
  } catch {
    return false
  }
}

function createProgressStream(onProgress) {
  let downloaded = 0

  return new Transform({
    transform(chunk, encoding, callback) {
      downloaded += chunk.length

      try {
        onProgress(downloaded)
      } catch {}

      callback(null, chunk)
    }
  })
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return conn.reply(
      m.chat,
      `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📥 𝐌𝐄𝐃𝐈𝐀𝐅𝐈𝐑𝐄 📥╮
┃֪࣪
├ׁ̟̇❍✎ Ingresa un enlace de MediaFire
├ׁ̟̇❍✎ para descargar el archivo.
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
      m
    )
  }

  let tmpDir
  let filePath

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    const res = await mediafire(args[0])

    const extension =
      res.ext && res.ext !== 'bin'
        ? res.ext.replace(/^\./, '')
        : 'bin'

    const safeName = cleanFilename(res.filename)

    const finalName = `${safeName}.${extension}`

    tmpDir = path.resolve(process.cwd(), 'tmp')

    await fs.promises.mkdir(tmpDir, {
      recursive: true
    })

    filePath = path.join(
      tmpDir,
      `${Date.now()}-${Math.random().toString(36).slice(2)}-${finalName}`
    )

    const initialCaption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${res.size}
├ׁ̟̇❍✎ Subido » ${res.aploud}
├ׁ̟̇❍✎ Estado » ⏬ Descargando...
├ׁ̟̇❍✎
├ׁ̟̇❍✎ ${progressBar(0)} 0%
├ׁ̟̇❍✎ Transferido » 0 B / ${res.size}
├ׁ̟̇❍✎ Velocidad » Calculando...
├ׁ̟̇❍✎ Tiempo restante » Calculando...
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

    const statusMessage = await conn.sendMessage(
      m.chat,
      {
        image: {
          url: 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg'
        },
        caption: initialCaption,
        contextInfo: {
          isForwarded: true
        }
      },
      {
        quoted: m
      }
    )

    const totalBytes =
      Number(res.sizeB) > 0
        ? Number(res.sizeB)
        : 0

    const startTime = Date.now()
    let lastUpdate = 0
    let lastPercent = -1

    const response = await axios.get(res.url, {
      responseType: 'stream',
      timeout: 120000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36'
      }
    })

    const responseLength =
      Number(response.headers?.['content-length']) || 0

    const total =
      totalBytes > 0
        ? totalBytes
        : responseLength

    const progressStream = createProgressStream(async downloaded => {
      const now = Date.now()

      if (now - lastUpdate < 1000) return

      lastUpdate = now

      const elapsed = Math.max(
        (now - startTime) / 1000,
        0.001
      )

      const speed = downloaded / elapsed

      const percent =
        total > 0
          ? Math.min(
              100,
              Math.floor((downloaded / total) * 100)
            )
          : 0

      if (percent === lastPercent) return

      lastPercent = percent

      const remaining =
        total > 0 && speed > 0
          ? (total - downloaded) / speed
          : 0

      const caption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${res.size}
├ׁ̟̇❍✎ Subido » ${res.aploud}
├ׁ̟̇❍✎ Estado » ⏬ Descargando...
├ׁ̟̇❍✎
├ׁ̟̇❍✎ ${progressBar(percent)} ${percent}%
├ׁ̟̇❍✎ Transferido » ${formatBytes(downloaded)} / ${total > 0 ? formatBytes(total) : res.size}
├ׁ̟̇❍✎ Velocidad » ${formatBytes(speed)}/s
├ׁ̟̇❍✎ Tiempo restante » ${formatTime(remaining)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

      await editCaption(
        conn,
        m.chat,
        statusMessage.key,
        caption
      )
    })

    await pipeline(
      response.data,
      progressStream,
      fs.createWriteStream(filePath)
    )

    const stats = await fs.promises.stat(filePath)

    const finalSize = formatBytes(stats.size)

    const finalCaption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 𝐋𝐈𝐒𝐓𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${finalSize}
├ׁ̟̇❍✎ Subido » ${res.aploud}
├ׁ̟̇❍✎ Estado » 📤 Enviando a WhatsApp...
├ׁ̟̇❍✎
├ׁ̟̇❍✎ ${progressBar(100)} 100%
├ׁ̟̇❍✎ Transferido » ${finalSize}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

    await editCaption(
      conn,
      m.chat,
      statusMessage.key,
      finalCaption
    )

    await conn.sendFile(
      m.chat,
      filePath,
      finalName,
      '',
      m
    )

    const completedCaption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼✅ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tamaño » ${finalSize}
├ׁ̟̇❍✎ Estado » ✅ Enviado correctamente
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

    await editCaption(
      conn,
      m.chat,
      statusMessage.key,
      completedCaption
    )

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (e) {
    try {
      if (filePath) {
        await fs.promises.rm(filePath, {
          force: true
        })
      }
    } catch {}

    const errorMessage = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐅𝐀𝐋𝐋𝐈𝐃𝐀 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No fue posible completar la descarga.
├ׁ̟̇❍✎ Motivo » ${e?.message || 'Error desconocido'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

    if (typeof statusMessage !== 'undefined' && statusMessage?.key) {
      await editCaption(
        conn,
        m.chat,
        statusMessage.key,
        errorMessage
      )
    } else {
      await conn.reply(
        m.chat,
        errorMessage,
        m
      )
    }

    await conn.sendMessage(m.chat, {
      react: {
        text: '⚠️',
        key: m.key
      }
    })
  }
}

handler.command = ['mediafire', 'mf']
handler.tags = ['descargas']
handler.help = ['mediafire']
handler.group = true

export default handler