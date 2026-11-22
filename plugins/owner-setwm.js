import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *إعداد العلامة المائية (ستيكرز)*\n\n` +
      `📌 *الاستخدام:* .setwm <النص>\n\n` +
      `📋 *القيمة الحالية للبوت ده:* *${getBotConfig(conn, 'wm')}*\n\n` +
      `💡 *Ejemplos:*\n` +
      `› .setwm MiBot\n` +
      `› .setwm © Hina`
    )
  }

  const nuevoWm = text.trim()
  const anterior = getBotConfig(conn, 'wm')

  setBotConfig(conn, 'wm', nuevoWm)

  await m.reply(
    `✅ *العلامة المائية اتحدّثت للبوت ده*\n\n` +
    `› السابق: *${anterior}*\n` +
    `› Nueva: *${nuevoWm}*\n\n` +
    `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['مائية']
handler.tags = ['owner']
handler.command = ['setwm', 'watermark', 'مائية', 'علامة']
handler.owner = true

export default handler
