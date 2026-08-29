import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

function parseFileSize(size) {
  if (!size) return 0

  const units = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4
  }

  const match = String(size)
    .trim()
    .match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)

  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  return Math.round(value * units[unit])
}

function formatBytes(bytes) {
  bytes = Number(bytes) || 0

  if (bytes >= 1024 ** 3)
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`

  if (bytes >= 1024 ** 2)
    return `${(bytes / 1024 ** 2).toFixed(2)} MB`

  if (bytes >= 1024)
    return `${(bytes / 1024).toFixed(2)} KB`

  return `${bytes} B`
}

function progressBar(percent, length = 15) {
  percent = Math.max(0, Math.min(100, Number(percent) || 0))

  const filled = Math.round((percent / 100) * length)

  return '█'.repeat(filled) + '░'.repeat(length - filled)
}

async function mediafire(url) {
  if (!url) throw new Error('URL requerida')

  const { data } = await axios.get(url, {
    timeout: 30000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
    }
  })

  const $ = cheerio.load(data)

  const link1 = ($('#downloadButton').attr('href') || '').trim()
  const link2 = ($('#download_link > a.retry').attr('href') || '').trim()

  const $intro = $('div.dl-info > div.intro')

  let filename = $intro.find('div.filename').text().trim()
  let filetype = $intro.find('div.filetype > span').eq(0).text().trim()

  const extMatch = /\(\.(.*?)\)/.exec(
    $intro.find('div.filetype > span').eq(1).text()
  )

  let ext = extMatch?.[1]?.trim() || 'bin'

  const $li = $('div.dl-info > ul.details > li')

  const aploud = $li.eq(1).find('span').text().trim()
  const size = $li.eq(0).find('span').text().trim()
  const sizeB = parseFileSize(size)

  if (!link1 && !link2)
    throw new Error('No se pudo obtener el enlace de descarga')

  filename = filename || 'archivo'
  filetype = filetype || 'Archivo'

  return {
    filename,
    url: link1 || link2,
    type: filetype,
    ext,
    aploud: aploud || 'Desconocido',
    size: size || 'Desconocido',
    sizeB
  }
}

async function downloadFile(url, filePath, onProgress) {
  const response = await axios.get(url, {
    responseType: 'stream',
    timeout: 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      Accept: '*/*'
    }
  })

  const total =
    Number(response.headers['content-length']) ||
    0

  let downloaded = 0
  let lastUpdate = 0

  response.data.on('data', chunk => {
    downloaded += chunk.length

    if (!onProgress) return

    const now = Date.now()

    if (
      now - lastUpdate >= 1500 ||
      (total > 0 && downloaded >= total)
    ) {
      lastUpdate = now

      const percent = total > 0
        ? Math.min(100, (downloaded / total) * 100)
        : 0

      onProgress({
        downloaded,
        total,
        percent
      }).catch(() => {})
    }
  })

  await pipeline(
    response.data,
    fs.createWriteStream(filePath)
  )

  return {
    downloaded,
    total
  }
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

  let filePath = null
  let progressMessage = null
  let lastPercent = -1

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    const res = await mediafire(args[0])

    const safeFilename = String(res.filename || 'archivo')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .trim()

    const safeExt = String(res.ext || 'bin')
      .replace(/[^a-zA-Z0-9]/g, '')
      .trim()

    const finalName = safeExt
      ? `${safeFilename}.${safeExt}`
      : safeFilename

    const tmpDir = path.resolve(process.cwd(), 'tmp')

    await fs.promises.mkdir(tmpDir, {
      recursive: true
    })

    filePath = path.join(tmpDir, `${Date.now()}-${finalName}`)

    const initialCaption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${res.size}
├ׁ̟̇❍✎ Subido » ${res.aploud}
├ׁ̟̇❍✎ Estado » ⏬ Descargando...
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

    const sent = await conn.sendMessage(
      m.chat,
      {
        image: {
          url: 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg'
        },
        caption: initialCaption
      },
      { quoted: m }
    )

    progressMessage = sent

    const updateProgress = async ({
      downloaded,
      total,
      percent
    }) => {
      if (!progressMessage) return

      const rounded = total > 0
        ? Math.floor(percent)
        : 0

      if (rounded === lastPercent)
        return

      lastPercent = rounded

      const totalText =
        total > 0
          ? formatBytes(total)
          : res.size

      const progressText =
        total > 0
          ? `${progressBar(rounded)} ${rounded}%`
          : `${progressBar(0)} Calculando...`

      const caption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${res.size}
├ׁ̟̇❍✎ Progreso » ${progressText}
├ׁ̟̇❍✎ Descargado » ${formatBytes(downloaded)} / ${totalText}
├ׁ̟̇❍✎ Estado » ⏬ Descargando...
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

      try {
        await conn.sendMessage(
          m.chat,
          {
            image: {
              url: 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg'
            },
            caption
          },
          { quoted: m }
        )
      } catch {}
    }

    const result = await downloadFile(
      res.url,
      filePath,
      updateProgress
    )

    const finalSize =
      result.total > 0
        ? result.total
        : result.downloaded

    const finalCaption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${formatBytes(finalSize)}
├ׁ̟̇❍✎ Progreso » ${progressBar(100)} 100%
├ׁ̟̇❍✎ Estado » ✅ Descarga completada
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

    try {
      await conn.sendMessage(
        m.chat,
        {
          image: {
            url: 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg'
          },
          caption: finalCaption
        },
        { quoted: m }
      )
    } catch {}

    await conn.sendMessage(
      m.chat,
      {
        document: {
          url: filePath
        },
        mimetype: 'application/octet-stream',
        fileName: finalName
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (e) {
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '⚠️',
          key: m.key
        }
      })
    } catch {}

    await conn.reply(
      m.chat,
      `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐅𝐀𝐋𝐋𝐈𝐃𝐀 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No fue posible enviar el archivo.
├ׁ̟̇❍✎ Motivo » ${String(e?.message || e)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
      m
    )

  } finally {
    if (filePath) {
      try {
        await fs.promises.unlink(filePath)
      } catch {}
    }
  }
}

handler.command = ['mediafire', 'mf']
handler.tags = ['descargas']
handler.help = ['mediafire']
handler.group = true

export default handler