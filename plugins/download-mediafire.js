import axios from 'axios'
import * as cheerio from 'cheerio'

function parseFileSize(size) {
  if (!size) return 0
  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
  const match = size.toString().trim().match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)
  if (!match) return 0
  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  return Math.round(value * units[unit])
}

async function mediafire(url) {
  if (!url) throw new Error('URL requerida')

  const { data } = await axios.get(url, {
    timeout: 15000
  })

  const $ = cheerio.load(data)

  const link1 = ($('#downloadButton').attr('href') || '').trim()
  const link2 = ($('#download_link > a.retry').attr('href') || '').trim()

  const $intro = $('div.dl-info > div.intro')

  const filename = $intro.find('div.filename').text().trim()
  const filetype = $intro.find('div.filetype > span').eq(0).text().trim()

  const extMatch = /\(\.(.*?)\)/.exec(
    $intro.find('div.filetype > span').eq(1).text()
  )

  const ext = extMatch?.[1]?.trim() || 'bin'

  const $li = $('div.dl-info > ul.details > li')

  const aploud = $li.eq(1).find('span').text().trim()
  const size = $li.eq(0).find('span').text().trim()
  const sizeB = parseFileSize(size)

  if (!link1 && !link2) throw new Error('No se pudo obtener el link')

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

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const res = await mediafire(args[0])

    await conn.sendMessage(m.chat, {
      image: { url: 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg' },
      caption: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${res.filename}.${res.ext}
├ׁ̟̇❍✎ Tipo » ${res.type}
├ׁ̟̇❍✎ Tamaño » ${res.size}
├ׁ̟̇❍✎ Subido » ${res.aploud}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
    }, { quoted: m })

    await conn.sendFile(
      m.chat,
      res.url,
      `${res.filename}.${res.ext}`,
      '',
      m
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    await conn.reply(
      m.chat,
      `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐄𝐑𝐑𝐎𝐑 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No se pudo descargar el archivo
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
      m
    )

    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.command = ['mediafire', 'mf']
handler.tags = ['descargas']
handler.help = ['mediafire']
handler.group = true

export default handler