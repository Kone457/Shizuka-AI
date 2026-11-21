import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *إعداد اسم البوت*\n\n` +
      `📌 *الاستخدام:* .setname <الاسم الجديد>\n\n` +
      `📋 *القيم الحالية للبوت ده:*\n` +
      `› الاسم القصير: *${getBotConfig(conn, 'botname')}*\n` +
      `› الاسم الكامل: *${getBotConfig(conn, 'namebot')}*\n\n` +
      `💡 *Ejemplos:*\n` +
      `› .setname MiBot\n` +
      `› .setname2 MyBot-AI _(للاسم الكامل)_`
    )
  }

  const nuevoNombre = text.trim()
  const anterior = getBotConfig(conn, 'botname')

  setBotConfig(conn, 'botname', nuevoNombre)
  setBotConfig(conn, 'namebot', nuevoNombre)

  await m.reply(
    `✅ *الاسم اتحدّث للبوت ده*\n\n` +
    `› السابق: *${anterior}*\n` +
    `› الجديد: *${nuevoNombre}*\n\n` +
    `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['اسمالبوت']
handler.tags = ['owner']
handler.command = ['setname', 'setnombre', 'اسمالبوت', 'اسم2']
handler.owner = true

export default handler
