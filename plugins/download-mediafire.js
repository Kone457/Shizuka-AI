import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const MAX_SIZE = 2 * 1024 * 1024 * 1024

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
    .replace(',', '.')
    .match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)

  if (!match) return 0

  const value = Number(match[1])
  const unit = match[2].toUpperCase()

  if (!Number.isFinite(value) || !units[unit]) return 0

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

function formatSpeed(bytes) {
  return `${formatBytes(bytes)}/s`
}

function progressBar(percent, length = 20) {
  percent = Math.max(0, Math.min(100, Number(percent) || 0))

  const filled = Math.round(
    (percent / 100) * length
  )

  return '█'.repeat(filled) +
    '░'.repeat(length - filled)
}

function cleanFilename(filename, ext) {
  let name = String(filename || 'archivo')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim()

  let extension = String(ext || 'bin')
    .replace(/^\.+/, '')
    .trim()

  if (!extension)
    extension = 'bin'

  name = name.replace(/\.[a-z0-9]{1,10}$/i, '')

  return `${name}.${extension}`
}

async function mediafire(url) {
  if (!url)
    throw new Error('URL requerida.')

  const { data } = await axios.get(url, {
    timeout: 30000,
    maxContentLength: MAX_SIZE,
    maxBodyLength: MAX_SIZE,
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

  const intro =
    $('div.dl-info > div.intro')

  const filename =
    intro.find('div.filename').text().trim() ||
    'archivo'

  const filetype =
    intro.find('div.filetype > span')
      .eq(0)
      .text()
      .trim() ||
    'Archivo'

  const extensionText =
    intro.find('div.filetype > span')
      .eq(1)
      .text()
      .trim()

  const extMatch =
    extensionText.match(/\(\.(.*?)\)/)

  const ext =
    extMatch?.[1]?.trim() ||
    path.extname(filename).replace('.', '') ||
    'bin'

  const details =
    $('div.dl-info > ul.details > li')

  const size =
    details.eq(0).find('span').text().trim()

  const aploud =
    details.eq(1).find('span').text().trim()

  const sizeB =
    parseFileSize(size)

  const downloadUrl =
    link1 || link2

  if (!downloadUrl)
    throw new Error(
      'MediaFire no proporcionó un enlace de descarga.'
    )

  if (sizeB > MAX_SIZE)
    throw new Error(
      'El archivo supera el límite de 2 GB.'
    )

  return {
    filename: cleanFilename(filename, ext),
    url: downloadUrl,
    type: filetype,
    ext,
    aploud,
    size,
    sizeB
  }
}

const handler = async (m, { conn, args }) => {
  if (!args?.[0]) {
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

  let tempPath = null
  let progressMessage = null
  let progressKey = null
  let lastUpdate = 0
  let updatePromise = null

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    const res = await mediafire(args[0])

    const tmpDir =
      path.resolve(process.cwd(), '..', 'tmp')

    fs.mkdirSync(tmpDir, {
      recursive: true
    })

    const filename =
      res.filename ||
      `mediafire_${Date.now()}.bin`

    tempPath = path.join(
      tmpDir,
      `${Date.now()}_${Math.random().toString(36).slice(2)}_${filename}`
    )

    progressMessage =
      await conn.sendMessage(
        m.chat,
        {
          text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${filename}
├ׁ̟̇❍✎ Tipo » ${res.type || 'Archivo'}
├ׁ̟̇❍✎ Tamaño » ${res.size || 'Desconocido'}
├ׁ̟̇❍✎ Subido » ${res.aploud || 'Desconocido'}
├ׁ̟̇❍✎ Estado » ⏬ Descargando...
┃
├ׁ̟̇❍✎ ${progressBar(0)}
├ׁ̟̇❍✎ 0%
├ׁ̟̇❍✎ 0 B / ${res.size || 'Desconocido'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
        },
        { quoted: m }
      )

    progressKey =
      progressMessage?.key

    const response =
      await axios.get(res.url, {
        responseType: 'stream',
        timeout: 180000,
        maxContentLength: MAX_SIZE,
        maxBodyLength: MAX_SIZE,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
        }
      })

    const headerSize =
      Number(
        response.headers?.['content-length']
      ) || 0

    const totalSize =
      headerSize ||
      Number(res.sizeB) ||
      0

    if (totalSize > MAX_SIZE) {
      response.data.destroy()
      throw new Error(
        'El archivo supera el límite máximo de 2 GB.'
      )
    }

    let downloaded = 0
    let previousBytes = 0
    let previousTime = Date.now()
    let speed = 0
    let lastPercent = -1

    const editProgress = async force => {
      if (!progressKey)
        return

      const now = Date.now()

      if (
        !force &&
        now - lastUpdate < 2500
      ) {
        return
      }

      if (updatePromise)
        return updatePromise

      const percent =
        totalSize > 0
          ? Math.min(
              100,
              Math.floor(
                (downloaded / totalSize) * 100
              )
            )
          : 0

      if (
        !force &&
        percent === lastPercent
      ) {
        return
      }

      const elapsed =
        Math.max(
          (now - previousTime) / 1000,
          0.001
        )

      speed =
        (downloaded - previousBytes) /
        elapsed

      previousBytes =
        downloaded

      previousTime =
        now

      lastPercent =
        percent

      lastUpdate =
        now

      const text = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${filename}
├ׁ̟̇❍✎ Tipo » ${res.type || 'Archivo'}
├ׁ̟̇❍✎ Tamaño » ${res.size || formatBytes(totalSize)}
├ׁ̟̇❍✎ Subido » ${res.aploud || 'Desconocido'}
├ׁ̟̇❍✎ Estado » ⏬ Descargando...
┃
├ׁ̟̇❍✎ ${progressBar(percent)}
├ׁ̟̇❍✎ ${percent}%
├ׁ̟̇❍✎ ${formatBytes(downloaded)} / ${formatBytes(totalSize)}
├ׁ̟̇❍✎ Velocidad » ${formatSpeed(speed)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()

      updatePromise =
        conn.sendMessage(
          m.chat,
          {
            text,
            edit: progressKey
          }
        ).catch(() => {}).finally(() => {
          updatePromise = null
        })

      return updatePromise
    }

    response.data.on(
      'data',
      chunk => {
        downloaded += chunk.length

        if (downloaded > MAX_SIZE) {
          response.data.destroy(
            new Error(
              'El archivo supera el límite máximo de 2 GB.'
            )
          )
          return
        }

        editProgress(false)
          .catch(() => {})
      }
    )

    await pipeline(
      response.data,
      fs.createWriteStream(tempPath)
    )

    await editProgress(true)

    const stats =
      await fs.promises.stat(tempPath)

    if (!stats.isFile())
      throw new Error(
        'El archivo descargado no es válido.'
      )

    if (stats.size > MAX_SIZE)
      throw new Error(
        'El archivo supera el límite máximo de 2 GB.'
      )

    if (progressKey) {
      await conn.sendMessage(
        m.chat,
        {
          text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📤 𝐄𝐍𝐕𝐈𝐀𝐍𝐃𝐎 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📤╮
┃֪࣪
├ׁ̟̇❍✎ ${filename}
├ׁ̟̇❍✎ Tamaño » ${formatBytes(stats.size)}
├ׁ̟̇❍✎ Estado » 📤 Preparando envío...
┃
├ׁ̟̇❍✎ ${progressBar(100)}
├ׁ̟̇❍✎ 100%
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
          edit: progressKey
        }
      ).catch(() => {})
    }

    await conn.sendMessage(
      m.chat,
      {
        document: fs.createReadStream(tempPath),
        fileName: filename,
        mimetype: 'application/octet-stream'
      },
      {
        quoted: m
      }
    )

    if (progressKey) {
      await conn.sendMessage(
        m.chat,
        {
          text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼✅ 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 𝐄𝐍𝐕𝐈𝐀𝐃𝐎 ✅╮
┃֪࣪
├ׁ̟̇❍✎ ${filename}
├ׁ̟̇❍✎ Tamaño » ${formatBytes(stats.size)}
├ׁ̟̇❍✎ Estado » 🟢 Completado correctamente
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
          edit: progressKey
        }
      ).catch(() => {})
    }

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (e) {
    const error =
      e?.message
        ? String(e.message)
        : 'Error desconocido.'

    if (progressKey) {
      await conn.sendMessage(
        m.chat,
        {
          text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐅𝐀𝐋𝐋𝐈𝐃𝐀 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No fue posible enviar el archivo.
├ׁ̟̇❍✎ Motivo » ${error}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
          edit: progressKey
        }
      ).catch(async () => {
        await conn.reply(
          m.chat,
          `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐅𝐀𝐋𝐋𝐈𝐃𝐀 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No fue posible enviar el archivo.
├ׁ̟̇❍✎ Motivo » ${error}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
          m
        ).catch(() => {})
      })
    } else {
      await conn.reply(
        m.chat,
        `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐅𝐀𝐋𝐋𝐈𝐃𝐀 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No fue posible enviar el archivo.
├ׁ̟̇❍✎ Motivo » ${error}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
        m
      ).catch(() => {})
    }

    await conn.sendMessage(m.chat, {
      react: {
        text: '⚠️',
        key: m.key
      }
    }).catch(() => {})

  } finally {
    if (tempPath) {
      try {
        await fs.promises.unlink(tempPath)
      } catch {}
    }
  }
}

handler.command = ['mediafire', 'mf']
handler.tags = ['descargas']
handler.help = ['mediafire']
handler.group = true

export default handler