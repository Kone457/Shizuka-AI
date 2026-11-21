import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *إعداد الاسم الكامل للبوت*\n\n` +
      `📌 *الاستخدام:* .setname2 <الاسم الكامل>\n\n` +
      `📋 *القيمة الحالية للبوت ده:*\n` +
      `› الاسم الكامل: *${getBotConfig(conn, 'namebot')}*\n\n` +
      `💡 *مثال:* .setname2 Shizuka-AI`
    )
  }

  const nuevoNombre = text.trim()
  const anterior = getBotConfig(conn, 'namebot')

  setBotConfig(conn, 'namebot', nuevoNombre)

  await m.reply(
    `✅ *الاسم الكامل اتحدّث للبوت ده*\n\n` +
    `› السابق: *${anterior}*\n` +
    `› الجديد: *${nuevoNombre}*\n\n` +
    `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['الاسم الكامل']
handler.tags = ['owner']
handler.command = ['setname2', 'setnombrebot', 'الاسمالكامل', 'اسم3', 'الاسم الكامل', 'الاسم_الكامل']
handler.owner = true

export default handler
