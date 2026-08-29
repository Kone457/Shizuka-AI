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

  const match = size.toString().trim().match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  return Math.round(value * units[unit])
}

async function mediafire(url) {
  if (!url) throw new Error('URL requerida')

  const { data } = await axios.get(url, {
    timeout: 30000,
    maxContentLength: 10 * 1024 * 1024,
    maxBodyLength: 10 * 1024 * 1024,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
    }
  })

  const $ = cheerio.load(data)

  const link1 = ($('#downloadButton').attr('href') || '').trim()
  const link2 = ($('#download_link > a.retry').attr('href') || '').trim()

  const $intro = $('div.dl-info > div.intro')

  const filename =
    $intro.find('div.filename').text().trim() || 'archivo'

  const filetype =
    $intro.find('div.filetype > span').eq(0).text().trim() || 'Archivo'

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

async function downloadFile(url, filePath) {
  const response = await axios.get(url, {
    responseType: 'stream',
    timeout: 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    maxRedirects: 10,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      Accept: '*/*'
    }
  })

  await pipeline(
    response.data,
    fs.createWriteStream(filePath)
  )

  return response.headers
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

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    const res = await mediafire(args[0])

    const MAX_SIZE = 2 * 1024 ** 3

    if (res.sizeB > MAX_SIZE) {
      throw new Error('El archivo supera el límite máximo de 2 GB')
    }

    const tmpDir = path.join(process.cwd(), 'tmp')

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, {
        recursive: true
      })
    }

    const safeName = `${res.filename}.${res.ext}`
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()

    filePath = path.join(
      tmpDir,
      `${Date.now()}_${safeName}`
    )

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url: 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg'
        },
        caption: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${safeName}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${res.size}
├ׁ̟̇❍✎ Subido » ${res.aploud}
├ׁ̟̇❍✎ Estado » ⏬ Descargando...
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
      },
      {
        quoted: m
      }
    )

    await downloadFile(res.url, filePath)

    const stats = fs.statSync(filePath)

    if (stats.size > MAX_SIZE) {
      throw new Error('El archivo supera el límite máximo de 2 GB')
    }

    await conn.sendMessage(
      m.chat,
      {
        document: fs.createReadStream(filePath),
        fileName: safeName,
        mimetype: 'application/octet-stream'
      },
      {
        quoted: m
      }
    )

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (e) {
    await conn.reply(
      m.chat,
      `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 𝐅𝐀𝐋𝐋𝐈𝐃𝐀 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No fue posible enviar el archivo.
├ׁ̟̇❍✎ Motivo » ${e.message || 'Error desconocido'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
      m
    )

    await conn.sendMessage(m.chat, {
      react: {
        text: '⚠️',
        key: m.key
      }
    })

  } finally {
    if (filePath) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch {}
    }
  }
}

handler.command = ['mediafire', 'mf']
handler.tags = ['descargas']
handler.help = ['mediafire']
handler.group = true

export default handler