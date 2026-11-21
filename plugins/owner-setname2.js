import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *إعداد الاسم الكامل للبوت*\n\n` +
      `📌 *الاستخدام:* .setname2 <الاسم الكامل>\n\n` +
      `📋 *القيمة الحالية للبوت ده:*\n` +
      `› Nombre completo: *${getBotConfig(conn, 'namebot')}*\n\n` +
      `💡 *مثال:* .setname2 Shizuka-AI`
    )
  }

  const nuevoNombre = text.trim()
  const anterior = getBotConfig(conn, 'namebot')

  setBotConfig(conn, 'namebot', nuevoNombre)

  await m.reply(
    `✅ *الاسم الكامل اتحدّث للبوت ده*\n\n` +
    `› Anterior: *${anterior}*\n` +
    `› الجديد: *${nuevoNombre}*\n\n` +
    `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['setname2']
handler.tags = ['owner']
handler.command = ['setname2', 'setnombrebot']
handler.owner = true

export default handler
