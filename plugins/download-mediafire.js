import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const IMAGE_URL = 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg'

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

  return Math.round(
    parseFloat(match[1]) * units[match[2].toUpperCase()]
  )
}

function formatBytes(bytes) {
  bytes = Number(bytes) || 0

  if (bytes >= 1024 ** 4)
    return `${(bytes / 1024 ** 4).toFixed(2)} TB`

  if (bytes >= 1024 ** 3)
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`

  if (bytes >= 1024 ** 2)
    return `${(bytes / 1024 ** 2).toFixed(2)} MB`

  if (bytes >= 1024)
    return `${(bytes / 1024).toFixed(2)} KB`

  return `${bytes} B`
}

function formatSpeed(bytesPerSecond) {
  return `${formatBytes(bytesPerSecond)}/s`
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0)
    return 'Calculando...'

  seconds = Math.floor(seconds)

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0)
    return `${hours}h ${minutes}m ${secs}s`

  if (minutes > 0)
    return `${minutes}m ${secs}s`

  return `${secs}s`
}

function progressBar(percent, length = 18) {
  percent = Math.max(
    0,
    Math.min(100, Number(percent) || 0)
  )

  const filled = Math.floor(
    (percent / 100) * length
  )

  return (
    '█'.repeat(filled) +
    '░'.repeat(length - filled)
  )
}

async function mediafire(url) {
  if (!url)
    throw new Error('URL requerida')

  const { data } = await axios.get(url, {
    timeout: 30000,
    maxRedirects: 10,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
    }
  })

  const $ = cheerio.load(data)

  const link1 =
    ($('#downloadButton').attr('href') || '').trim()

  const link2 =
    ($('#download_link > a.retry').attr('href') || '').trim()

  const $intro = $('div.dl-info > div.intro')

  let filename =
    $intro.find('div.filename').text().trim()

  let filetype =
    $intro.find('div.filetype > span')
      .eq(0)
      .text()
      .trim()

  const extMatch =
    /\(\.(.*?)\)/.exec(
      $intro.find('div.filetype > span')
        .eq(1)
        .text()
    )

  let ext =
    extMatch?.[1]?.trim() || 'bin'

  const $li =
    $('div.dl-info > ul.details > li')

  const aploud =
    $li.eq(1).find('span').text().trim()

  const size =
    $li.eq(0).find('span').text().trim()

  const sizeB =
    parseFileSize(size)

  if (!link1 && !link2)
    throw new Error(
      'No se pudo obtener el enlace de descarga'
    )

  filename =
    filename || 'archivo'

  filetype =
    filetype || 'Archivo'

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

async function downloadFile(
  url,
  filePath,
  onProgress
) {
  const response = await axios.get(url, {
    responseType: 'stream',
    timeout: 0,
    maxRedirects: 20,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    decompress: true,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      Accept: '*/*',
      Connection: 'keep-alive'
    }
  })

  const total =
    Number(response.headers['content-length']) ||
    0

  let downloaded = 0
  let lastTime = Date.now()
  let lastBytes = 0
  let lastUpdate = 0

  const stream = response.data

  stream.on('data', chunk => {
    downloaded += chunk.length

    const now = Date.now()
    const elapsed =
      (now - lastTime) / 1000

    if (
      elapsed >= 1 ||
      (total > 0 && downloaded >= total)
    ) {
      const bytesDelta =
        downloaded - lastBytes

      const speed =
        elapsed > 0
          ? bytesDelta / elapsed
          : 0

      const percent =
        total > 0
          ? Math.min(
              100,
              (downloaded / total) * 100
            )
          : 0

      const remaining =
        total > 0 && speed > 0
          ? (total - downloaded) / speed
          : 0

      const progress = {
        downloaded,
        total,
        percent,
        speed,
        remaining
      }

      lastTime = now
      lastBytes = downloaded

      if (
        now - lastUpdate >= 1000 ||
        (total > 0 && downloaded >= total)
      ) {
        lastUpdate = now

        if (onProgress)
          onProgress(progress).catch(() => {})
      }
    }
  })

  await pipeline(
    stream,
    fs.createWriteStream(filePath)
  )

  return {
    downloaded,
    total: total || downloaded
  }
}

function buildCaption({
  finalName,
  type,
  size,
  uploaded,
  status,
  percent,
  downloaded,
  total,
  speed,
  remaining
}) {
  const progress =
    progressBar(percent)

  return `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ Tipo » ${type}
├ׁ̟̇❍✎ Tamaño » ${size}
├ׁ̟̇❍✎ Subido » ${uploaded}
├ׁ̟̇❍✎ Estado » ${status}
├ׁ̟̇❍✎ Progreso » ${progress} ${Math.floor(percent)}%
├ׁ̟̇❍✎ Transferido » ${formatBytes(downloaded)} / ${formatBytes(total)}
├ׁ̟̇❍✎ Velocidad » ${speed > 0 ? formatSpeed(speed) : 'Calculando...'}
├ׁ̟̇❍✎ Tiempo restante » ${remaining > 0 ? formatTime(remaining) : 'Calculando...'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
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
  let updating = false

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    const res = await mediafire(args[0])

    const safeFilename =
      String(res.filename || 'archivo')
        .replace(
          /[<>:"/\\|?*\x00-\x1F]/g,
          '_'
        )
        .trim()

    const safeExt =
      String(res.ext || 'bin')
        .replace(
          /[^a-zA-Z0-9]/g,
          ''
        )
        .trim()

    const finalName =
      safeExt
        ? `${safeFilename}.${safeExt}`
        : safeFilename

    const tmpDir =
      path.join(process.cwd(), 'tmp')

    await fs.promises.mkdir(
      tmpDir,
      {
        recursive: true
      }
    )

    filePath = path.join(
      tmpDir,
      `${Date.now()}-${finalName}`
    )

    const initialCaption =
      buildCaption({
        finalName,
        type: res.type,
        size: res.size,
        uploaded: res.aploud,
        status: '⏬ Descargando...',
        percent: 0,
        downloaded: 0,
        total: res.sizeB || 0,
        speed: 0,
        remaining: 0
      })

    progressMessage =
      await conn.sendMessage(
        m.chat,
        {
          image: {
            url: IMAGE_URL
          },
          caption: initialCaption
        },
        {
          quoted: m
        }
      )

    const updateProgress = async ({
      downloaded,
      total,
      percent,
      speed,
      remaining
    }) => {
      if (
        !progressMessage ||
        updating
      )
        return

      const rounded =
        Math.floor(percent)

      if (
        rounded === lastPercent &&
        rounded !== 100
      )
        return

      lastPercent = rounded
      updating = true

      try {
        const caption =
          buildCaption({
            finalName,
            type: res.type,
            size: res.size,
            uploaded: res.aploud,
            status: '⏬ Descargando...',
            percent: rounded,
            downloaded,
            total:
              total ||
              res.sizeB ||
              downloaded,
            speed,
            remaining
          })

        await conn.sendMessage(
          m.chat,
          {
            image: {
              url: IMAGE_URL
            },
            caption
          },
          {
            edit: progressMessage.key
          }
        )
      } catch {}

      updating = false
    }

    const result =
      await downloadFile(
        res.url,
        filePath,
        updateProgress
      )

    const finalTotal =
      result.total ||
      result.downloaded ||
      res.sizeB ||
      0

    await new Promise(resolve =>
      setTimeout(resolve, 500)
    )

    const finalCaption =
      buildCaption({
        finalName,
        type: res.type,
        size: formatBytes(finalTotal),
        uploaded: res.aploud,
        status: '📤 Preparando envío a WhatsApp...',
        percent: 100,
        downloaded: finalTotal,
        total: finalTotal,
        speed: 0,
        remaining: 0
      })

    try {
      await conn.sendMessage(
        m.chat,
        {
          image: {
            url: IMAGE_URL
          },
          caption: finalCaption
        },
        {
          edit: progressMessage.key
        }
      )
    } catch {}

    await new Promise(resolve =>
      setTimeout(resolve, 1000)
    )

    await conn.sendMessage(
      m.chat,
      {
        document: {
          url: filePath
        },
        mimetype:
          'application/octet-stream',
        fileName: finalName
      },
      {
        quoted: m
      }
    )

    const completedCaption =
      buildCaption({
        finalName,
        type: res.type,
        size: formatBytes(finalTotal),
        uploaded: res.aploud,
        status: '✅ Envío completado',
        percent: 100,
        downloaded: finalTotal,
        total: finalTotal,
        speed: 0,
        remaining: 0
      })

    try {
      await conn.sendMessage(
        m.chat,
        {
          image: {
            url: IMAGE_URL
          },
          caption: completedCaption
        },
        {
          edit: progressMessage.key
        }
      )
    } catch {}

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '✅',
          key: m.key
        }
      }
    )

  } catch (e) {
    try {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '⚠️',
            key: m.key
          }
        }
      )
    } catch {}

    await conn.reply(
      m.chat,
      `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐅𝐀𝐋𝐋𝐈𝐃𝐀 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No fue posible descargar o enviar el archivo.
├ׁ̟̇❍✎ Motivo » ${String(e?.message || e)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
      m
    )

  } finally {
    if (filePath) {
      try {
        await fs.promises.unlink(
          filePath
        )
      } catch {}
    }
  }
}

handler.command = [
  'mediafire',
  'mf'
]

handler.tags = [
  'descargas'
]

handler.help = [
  'mediafire'
]

handler.group = true

export default handler