import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *إعداد باكج الستيكرز*\n\n` +
      `📌 *الاستخدام:* .setpack <اسم الباكج>\n\n` +
      `📋 *القيمة الحالية للبوت ده:* *${getBotConfig(conn, 'packname')}*\n\n` +
      `💡 *Ejemplos:*\n` +
      `› .setpack MiPack\n` +
      `› .setpack ستيكرز البوت`
    )
  }

  const nuevoPack = text.trim()
  const anterior = getBotConfig(conn, 'packname')

  setBotConfig(conn, 'packname', nuevoPack)

  await m.reply(
    `✅ *باكج الستيكرز اتحدّث للبوت ده*\n\n` +
    `› السابق: *${anterior}*\n` +
    `› الجديد: *${nuevoPack}*\n\n` +
    `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['باكج_البوت']
handler.tags = ['owner']
handler.command = ['setpack', 'packname', 'باكجالبوت', 'اسمالباكج', 'باكج البوت', 'اسم الباكج', 'باكج_البوت', 'اسم_الباكج']
handler.owner = true

export default handler
