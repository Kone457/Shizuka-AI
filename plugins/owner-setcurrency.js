import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *إعداد عملة البوت*\n\n` +
      `📌 *الاستخدام:* .setmoneda <الاسم>\n\n` +
      `📋 *العملة الحالية للبوت ده:* *${getBotConfig(conn, 'currency')}*\n\n` 
    )
  }

  const nuevaMoneda = text.trim()
  const anterior = getBotConfig(conn, 'currency')

  setBotConfig(conn, 'currency', nuevaMoneda)

  await m.reply(
    `✅ *العملة اتحدّثت للبوت ده*\n\n` +
    `› السابق: *${anterior}*\n` +
    `› Nueva: *${nuevaMoneda}*\n\n` +
    `> بيأثر على البوت ده بس (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['عملة البوت']
handler.tags = ['owner']
handler.command = ['setmoneda', 'setcurrency', 'moneda', 'عملةالبوت', 'العملة', 'كوينز', 'عملة البوت']
handler.owner = true

export default handler
