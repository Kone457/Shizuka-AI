import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

function formatSpeed(bytes) {
  return `${formatBytes(bytes)}/s`
}

function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(Number(seconds) || 0))

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0)
    return `${h}h ${m}m ${s}s`

  if (m > 0)
    return `${m}m ${s}s`

  return `${s}s`
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

  let ext =
    extMatch?.[1]?.trim() || 'bin'

  const $li =
    $('div.dl-info > ul.details > li')

  const uploaded =
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
    uploaded: uploaded || 'Desconocido',
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
    decompress: true,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      Accept: '*/*'
    }
  })

  const total =
    Number(response.headers['content-length']) || 0

  let downloaded = 0
  let lastBytes = 0
  let lastTime = Date.now()

  response.data.on('data', chunk => {
    downloaded += chunk.length

    const now = Date.now()
    const elapsed =
      (now - lastTime) / 1000

    if (elapsed >= 1) {
      const speed =
        (downloaded - lastBytes) / elapsed

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

      lastBytes = downloaded
      lastTime = now

      Promise.resolve(
        onProgress?.({
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
  transferred = 0,
  total = 0,
  speed = 0,
  remaining = 0
}) {
  const value = Math.floor(
    Math.max(
      0,
      Math.min(
        100,
        Number(percent) || 0
      )
    )
  )

  const totalText =
    total > 0
      ? formatBytes(total)
      : size

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
├ׁׁ̟̇❍✎ Transferido » ${formatBytes(transferred)} / ${totalText}
├ׁ̟̇❍✎ Velocidad » ${speed > 0 ? formatSpeed(speed) : 'Calculando...'}
├ׁ̟̇❍✎ Tiempo restante » ${remaining > 0 ? formatTime(remaining) : 'Calculando...'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
}

async function editProgressMessage(
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
        image: {
          url: IMAGE_URL
        },
        caption
      }
    )

    return true
  } catch {}

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

async function uploadWithProgress(
  conn,
  chat,
  filePath,
  fileName,
  total,
  onProgress,
  quoted
) {
  const stream = fs.createReadStream(filePath)

  let uploaded = 0
  let lastBytes = 0
  let lastTime = Date.now()

  stream.on('data', chunk => {
    uploaded += chunk.length

    const now = Date.now()
    const elapsed =
      (now - lastTime) / 1000

    if (elapsed >= 1) {
      const speed =
        (uploaded - lastBytes) / elapsed

      const percent =
        total > 0
          ? Math.min(
              100,
              (uploaded / total) * 100
            )
          : 0

      const remaining =
        total > 0 && speed > 0
          ? (total - uploaded) / speed
          : 0

      lastBytes = uploaded
      lastTime = now

      Promise.resolve(
        onProgress?.({
          uploaded,
          total,
          percent,
          speed,
          remaining
        })
      ).catch(() => {})
    }
  })

  const result =
    await conn.sendMessage(
      chat,
      {
        document: {
          stream
        },
        mimetype:
          'application/octet-stream',
        fileName
      },
      {
        quoted
      }
    )

  return {
    result,
    uploaded: total || uploaded
  }
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
  let messageKey = null

  let lastPercent = -1
  let lastEdit = 0
  let editQueue = Promise.resolve()

  const updateMessage = data => {
    editQueue = editQueue
      .then(async () => {
        const now = Date.now()

        if (
          now - lastEdit < 1200 &&
          data.percent < 100
        ) {
          return
        }

        const percent = Math.floor(
          Math.max(
            0,
            Math.min(
              100,
              Number(data.percent) || 0
            )
          )
        )

        if (
          percent === lastPercent &&
          percent !== 100
        ) {
          return
        }

        lastPercent = percent
        lastEdit = Date.now()

        await editProgressMessage(
          conn,
          m.chat,
          messageKey,
          buildCaption(data)
        )
      })
      .catch(() => {})

    return editQueue
  }

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

    progressMessage =
      await conn.sendMessage(
        m.chat,
        {
          image: {
            url: IMAGE_URL
          },
          caption:
            buildCaption({
              filename: finalName,
              type: res.type,
              size: res.size,
              uploaded: res.uploaded,
              status:
                '⏬ Descargando...',
              percent: 0,
              transferred: 0,
              total:
                res.sizeB,
              speed: 0,
              remaining: 0
            })
        },
        {
          quoted: m
        }
      )

    messageKey =
      progressMessage?.key

    const result =
      await downloadFile(
        res.url,
        filePath,
        data =>
          updateMessage({
            filename: finalName,
            type: res.type,
            size: res.size,
            uploaded: res.uploaded,
            status:
              '⏬ Descargando...',
            percent:
              data.percent,
            transferred:
              data.downloaded,
            total:
              data.total ||
              res.sizeB,
            speed:
              data.speed,
            remaining:
              data.remaining
          })
      )

    await editQueue

    const stat =
      await fs.promises.stat(
        filePath
      )

    const totalSize =
      stat.size ||
      result.downloaded ||
      res.sizeB ||
      0

    lastPercent = -1
    lastEdit = 0

    await updateMessage({
      filename: finalName,
      type: res.type,
      size: formatBytes(totalSize),
      uploaded: res.uploaded,
      status:
        '📤 Subiendo a WhatsApp...',
      percent: 0,
      transferred: 0,
      total: totalSize,
      speed: 0,
      remaining: 0
    })

    await editQueue

    await uploadWithProgress(
      conn,
      m.chat,
      filePath,
      finalName,
      totalSize,
      data =>
        updateMessage({
          filename: finalName,
          type: res.type,
          size: formatBytes(totalSize),
          uploaded: res.uploaded,
          status:
            '📤 Subiendo a WhatsApp...',
          percent:
            data.percent,
          transferred:
            data.uploaded,
          total:
            data.total,
          speed:
            data.speed,
          remaining:
            data.remaining
        }),
      m
    )

    await editQueue

    await updateMessage({
      filename: finalName,
      type: res.type,
      size: formatBytes(totalSize),
      uploaded: res.uploaded,
      status:
        '✅ Archivo enviado correctamente',
      percent: 100,
      transferred: totalSize,
      total: totalSize,
      speed: 0,
      remaining: 0
    })

    await editQueue

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

    if (messageKey) {
      const edited =
        await editProgressMessage(
          conn,
          m.chat,
          messageKey,
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