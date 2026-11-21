import { setBotConfig, getBotConfig } from '../lib/botconfig.js'
import uploadImage from '../lib/uploadImage.js'

let handler = async (m, { conn, text }) => {
  if (!text && !m.quoted) {
    return conn.sendMessage(m.chat, {
      image: { url: getBotConfig(conn, 'icon') },
      caption:
        `✿ *إعداد أيقونة البوت*\n\n` +
        `📌 *الاستخدام:* .seticon <url>\n` +
        `› كمان تقدر ترد على صورة بـ .seticon\n\n` +
        `📋 *الأيقونة الحالية للبوت ده:*\n` +
        `› ${getBotConfig(conn, 'icon')}\n\n` +
        `💡 *مثال:*\n` +
        `› .seticon https://i.imgur.com/ejemplo.jpg`
    }, { quoted: m })
  }

  let url = text?.trim() || ''

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

  const anterior = getBotConfig(conn, 'icon')
  setBotConfig(conn, 'icon', url)

  await conn.sendMessage(m.chat, {
    image: { url },
    caption:
      `✅ *الأيقونة اتحدّثت للبوت ده*\n\n` +
      `› السابق: ${anterior}\n` +
      `› الجديد: ${url}\n\n` +
      `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
  }, { quoted: m })
}

handler.help = ['ايقونة البوت']
handler.tags = ['owner']
handler.command = ['seticon', 'icono', 'ايقونةالبوت', 'ايقونة', 'ايقونة البوت', 'ايقونة_البوت']
handler.owner = true

export default handler
