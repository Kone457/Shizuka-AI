import { setBotConfig, getBotConfig } from '../lib/botconfig.js'
import uploadImage from '../lib/uploadImage.js'

async function getUrlFromMessage(m) {
  const urlFromArgs = null
  const q = m.quoted ? m.quoted : null
  if (q) {
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (/image/.test(mime)) {
      const img = await q.download()
      if (img) {
        const url = await uploadImage(img)
        return url
      }
    }
  }
  return urlFromArgs
}

let handler = async (m, { conn, text, args }) => {
  const cual = args[0]?.toLowerCase()

  if (!text && !m.quoted) {
    return m.reply(
      `✿ *إعداد بانر البوت*\n\n` +
      `📌 *الاستخدام:*\n` +
      `› .setbanner 1 <url> — Banner principal\n` +
      `› .setbanner 2 <url> — بانر ثانوي (القائمة)\n` +
      `› كمان تقدر ترد على صورة بـ .setbanner 1 أو .setbanner 2\n\n` +
      `📋 *القيم الحالية للبوت ده:*\n` +
      `› Banner 1: ${getBotConfig(conn, 'banner')}\n` +
      `› Banner 2: ${getBotConfig(conn, 'banner2')}\n\n` +
      `💡 *مثال:*\n` +
      `› .setbanner 1 https://i.imgur.com/ejemplo.jpg`
    )
  }

  if (cual !== '1' && cual !== '2') {
    return m.reply(`❌ حدد البانر: *.setbanner 1* أو *.setbanner 2*`)
  }

  let url = args.slice(1).join(' ').trim()

  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    const quoted = m.quoted
    if (!quoted) {
      return m.reply(`❌ لازم تدّي URL صحيح أو ترد على صورة.`)
    }
    const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || ''
    if (!/image/.test(mime)) {
      return m.reply(`❌ الرسالة المردود عليها مش صورة.`)
    }
    await m.reply(`⏳ برفع الصورة، استنى لحظة...`)
    try {
      const img = await quoted.download()
      url = await uploadImage(img)
    } catch (e) {
      return m.reply(`❌ خطأ في رفع الصورة: ${e.message}`)
    }
  }

  if (cual === '1') {
    const anterior = getBotConfig(conn, 'banner')
    setBotConfig(conn, 'banner', url)
    await conn.sendMessage(m.chat, {
      image: { url },
      caption:
        `✅ *البانر 1 اتحدّث للبوت ده*\n\n` +
        `› Anterior: ${anterior}\n` +
        `› الجديد: ${url}\n\n` +
        `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
    }, { quoted: m })
  } else {
    const anterior = getBotConfig(conn, 'banner2')
    setBotConfig(conn, 'banner2', url)
    await conn.sendMessage(m.chat, {
      image: { url },
      caption:
        `✅ *البانر 2 اتحدّث للبوت ده*\n\n` +
        `› Anterior: ${anterior}\n` +
        `› الجديد: ${url}\n\n` +
        `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
    }, { quoted: m })
  }
}

handler.help = ['setbanner']
handler.tags = ['owner']
handler.command = ['setbanner', 'banner']
handler.owner = true

export default handler
