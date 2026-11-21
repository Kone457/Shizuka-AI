
import axios from 'axios'
import * as cheerio from 'cheerio'

const MAX_SIZE = 1024 * 1024 * 1024
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
    throw new Error(`مقدرتش أتصل بـMediaFire: ${e.message}`)
  }

  if (!data || typeof data !== 'string') throw new Error('MediaFire مرجّعش HTML صحيح')

  const $ = cheerio.load(data)
  const link1 = ($('#downloadButton').attr('href') || '').trim()
  const link2 = ($('#download_link > a.retry').attr('href') || '').trim()

  if (!link1 && !link2) throw new Error('مفيش لينك تحميل')

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

  return {
    filename,
    url: link1 || link2,
    type: String(filetypeRaw).trim() || 'ملف',
    ext,
    aploud,
    size,
    sizeB: parseFileSize(size)
  }
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
├ׁ̟̇❍✎ اكتب لينك MediaFire
├ׁ̟̇❍✎ عشان تحمّل الملف
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(), m)
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    })

    const res = await mediafire(args[0])

    if (res.sizeB > MAX_SIZE) {
      await conn.sendMessage(m.chat, {
        react: { text: '⚠️', key: m.key }
      })
      return conn.reply(m.chat, `✿ الملف حجمه *${res.size}* وعدّى حد *1 GB*.`, m)
    }

    const finalName = nombreFinal(res.filename, res.ext)

    await conn.sendMessage(m.chat, {
      image: { url: 'https://i.postimg.cc/zXqQxh0Z/IMG-20260423-WA0574.jpg' },
      caption: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼📦 𝐀𝐑𝐂𝐇𝐈𝐕𝐎 📦╮
┃֪࣪
├ׁ̟̇❍✎ ${finalName}
├ׁ̟̇❍✎ النوع » ${res.type}
├ׁ̟̇❍✎ الحجم » ${res.size}
├ׁ̟̇❍✎ Subido » ${res.aploud}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '📤', key: m.key }
    })

    await conn.sendMessage(m.chat, {
      document: { url: res.url },
      fileName: finalName,
      mimetype: 'application/octet-stream'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    await conn.reply(m.chat, `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ خطأ ⛔╮
┃֪࣪
├ׁ̟̇❍✎ مقدرتش أحمّل الملف
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(), m)

    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    })
  }
}

handler.command = ['mediafire', 'mf', 'ميديافاير']
handler.tags = ['descargas']
handler.help = ['ميديافاير']
handler.group = true

export default handler
