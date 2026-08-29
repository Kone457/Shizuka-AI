import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGE_URL =
  'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg'

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
    parseFloat(match[1]) *
    units[match[2].toUpperCase()]
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
  seconds = Number(seconds) || 0

  if (!isFinite(seconds) || seconds <= 0)
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

  const filled = Math.round(
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

  const $intro =
    $('div.dl-info > div.intro')

  let filename =
    $intro.find('div.filename').text().trim()

  let filetype =
    $intro
      .find('div.filetype > span')
      .eq(0)
      .text()
      .trim()

  const extMatch =
    /\(\.(.*?)\)/.exec(
      $intro
        .find('div.filetype > span')
        .eq(1)
        .text()
    )

  const ext =
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

async function downloadFile(
  url,
  filePath,
  onProgress
) {
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
    Number(response.headers['content-length']) || 0

  let downloaded = 0
  let lastUpdate = Date.now()
  let lastBytes = 0

  response.data.on('data', chunk => {
    downloaded += chunk.length

    if (!onProgress)
      return

    const now = Date.now()
    const elapsed =
      (now - lastUpdate) / 1000

    if (
      elapsed >= 1 ||
      (total > 0 && downloaded >= total)
    ) {
      const bytesDiff =
        downloaded - lastBytes

      const speed =
        elapsed > 0
          ? bytesDiff / elapsed
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

      lastUpdate = now
      lastBytes = downloaded

      Promise.resolve(
        onProgress({
          downloaded,
          total,
          percent,
          speed,
          remaining
        })
      ).catch(() => {})
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

function buildCaption({
  filename,
  type,
  size,
  uploaded,
  status,
  percent = 0,
  downloaded = 0,
  total = 0,
  speed = 0,
  remaining = 0
}) {
  const value =
    Math.floor(
      Math.max(
        0,
        Math.min(100, percent)
      )
    )

  const totalBytes =
    total > 0
      ? total
      : parseFileSize(size)

  return `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${filename}
├ׁ̟̇❍✎ Tipo » ${type}
├ׁ̟̇❍✎ Tamaño » ${size}
├ׁ̟̇❍✎ Subido » ${uploaded}
├ׁ̟̇❍✎ Estado » ${status}
├ׁ̟̇❍✎ Progreso » ${progressBar(value)} ${value}%
├ׁ̟̇❍✎ Transferido » ${formatBytes(downloaded)} / ${formatBytes(totalBytes)}
├ׁ̟̇❍✎ Velocidad » ${speed > 0 ? formatSpeed(speed) : 'Calculando...'}
├ׁ̟̇❍✎ Tiempo restante » ${remaining > 0 ? formatTime(remaining) : 'Calculando...'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
}

async function editMessage(
  conn,
  chat,
  key,
  caption
) {
  if (!key)
    return false

  try {
    await conn.sendMessage(
      chat,
      {
        edit: key,
        caption
      }
    )

    return true
  } catch {}

  return false
}

const handler = async (
  m,
  { conn, args }
) => {
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
  let lastEdit = 0

  try {
    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '⏳',
          key: m.key
        }
      }
    )

    const res =
      await mediafire(args[0])

    const safeFilename =
      String(res.filename || 'archivo')
        .replace(
          /[<>:"/\\|?*\x00-\x1F]/g,
          '_'
        )
        .replace(/\.+$/, '')
        .trim() ||
      'archivo'

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
      path.resolve(
        __dirname,
        '..',
        'tmp'
      )

    await fs.promises.mkdir(
      tmpDir,
      {
        recursive: true
      }
    )

    filePath =
      path.join(
        tmpDir,
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}-${finalName}`
      )

    const initialCaption =
      buildCaption({
        filename: finalName,
        type: res.type,
        size: res.size,
        uploaded: res.aploud,
        status: '⏬ Descargando...',
        percent: 0,
        downloaded: 0,
        total: res.sizeB
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

    const messageKey =
      progressMessage?.key

    const updateProgress =
      async ({
        downloaded,
        total,
        percent,
        speed,
        remaining
      }) => {
        if (!messageKey)
          return

        const rounded =
          Math.floor(percent)

        const now = Date.now()

        if (
          rounded === lastPercent &&
          rounded !== 100
        ) {
          return
        }

        if (
          now - lastEdit < 1200 &&
          rounded !== 100
        ) {
          return
        }

        lastPercent = rounded
        lastEdit = now

        const caption =
          buildCaption({
            filename: finalName,
            type: res.type,
            size: res.size,
            uploaded: res.aploud,
            status: '⏬ Descargando...',
            percent: rounded,
            downloaded,
            total: total || res.sizeB,
            speed,
            remaining
          })

        await editMessage(
          conn,
          m.chat,
          messageKey,
          caption
        )
      }

    const result =
      await downloadFile(
        res.url,
        filePath,
        updateProgress
      )

    const finalSize =
      result.downloaded ||
      result.total ||
      res.sizeB

    const completedCaption =
      buildCaption({
        filename: finalName,
        type: res.type,
        size: formatBytes(finalSize),
        uploaded: res.aploud,
        status: '📥 Descarga completada',
        percent: 100,
        downloaded: finalSize,
        total: finalSize,
        speed: 0,
        remaining: 0
      })

    await editMessage(
      conn,
      m.chat,
      messageKey,
      completedCaption
    )

    await new Promise(resolve =>
      setTimeout(resolve, 500)
    )

    const sendingCaption =
      buildCaption({
        filename: finalName,
        type: res.type,
        size: formatBytes(finalSize),
        uploaded: res.aploud,
        status: '📤 Enviando archivo...',
        percent: 0,
        downloaded: 0,
        total: finalSize,
        speed: 0,
        remaining: 0
      })

    await editMessage(
      conn,
      m.chat,
      messageKey,
      sendingCaption
    )

    await new Promise(resolve =>
      setTimeout(resolve, 300)
    )

    let sentBytes = 0
    let sendStarted = Date.now()
    let lastSendEdit = 0
    let lastSendPercent = -1

    const documentStream =
      fs.createReadStream(
        filePath
      )

    const progressStream =
      new (await import('stream')).Transform({
        transform(chunk, encoding, callback) {
          sentBytes += chunk.length

          const now = Date.now()
          const elapsed =
            (now - sendStarted) / 1000

          const speed =
            elapsed > 0
              ? sentBytes / elapsed
              : 0

          const percent =
            finalSize > 0
              ? Math.min(
                  100,
                  (sentBytes / finalSize) * 100
                )
              : 0

          const remaining =
            speed > 0
              ? (finalSize - sentBytes) / speed
              : 0

          const rounded =
            Math.floor(percent)

          if (
            rounded !== lastSendPercent &&
            (
              now - lastSendEdit >= 1200 ||
              rounded === 100
            )
          ) {
            lastSendPercent =
              rounded

            lastSendEdit =
              now

            const caption =
              buildCaption({
                filename: finalName,
                type: res.type,
                size: formatBytes(finalSize),
                uploaded: res.aploud,
                status: '📤 Enviando archivo...',
                percent: rounded,
                downloaded: sentBytes,
                total: finalSize,
                speed,
                remaining
              })

            editMessage(
              conn,
              m.chat,
              messageKey,
              caption
            ).catch(() => {})
          }

          callback(null, chunk)
        }
      })

    documentStream.pipe(
      progressStream
    )

    await conn.sendMessage(
      m.chat,
      {
        document: {
          stream: progressStream
        },
        mimetype:
          'application/octet-stream',
        fileName: finalName
      },
      {
        quoted: m
      }
    )

    const finalSendCaption =
      buildCaption({
        filename: finalName,
        type: res.type,
        size: formatBytes(finalSize),
        uploaded: res.aploud,
        status: '✅ Archivo enviado correctamente',
        percent: 100,
        downloaded: finalSize,
        total: finalSize,
        speed: 0,
        remaining: 0
      })

    await editMessage(
      conn,
      m.chat,
      messageKey,
      finalSendCaption
    )

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

    const errorText =
      String(
        e?.message ||
        e ||
        'Error desconocido'
      )

    const errorCaption =
      `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐅𝐀𝐋𝐋𝐈𝐃𝐀 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No fue posible completar la operación.
├ׁ̟̇❍✎ Motivo » ${errorText}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

    if (progressMessage?.key) {
      const edited =
        await editMessage(
          conn,
          m.chat,
          progressMessage.key,
          errorCaption
        )

      if (!edited) {
        await conn.reply(
          m.chat,
          errorCaption,
          m
        )
      }
    } else {
      await conn.reply(
        m.chat,
        errorCaption,
        m
      )
    }

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