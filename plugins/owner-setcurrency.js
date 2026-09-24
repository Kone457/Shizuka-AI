import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *Configurar Moneda del Bot*\n\n` +
      `📌 *Uso:* .setmoneda <nombre>\n\n` +
      `📋 *Moneda actual de este bot:* *${getBotConfig(conn, 'currency')}*\n\n` 
    )
  }

  const nuevaMoneda = text.trim()
  const anterior = getBotConfig(conn, 'currency')

  setBotConfig(conn, 'currency', nuevaMoneda)

  await m.reply(
    `✅ *Moneda actualizada para este bot*\n\n` +
    `› Anterior: *${anterior}*\n` +
    `› Nueva: *${nuevaMoneda}*\n\n` +
    `> Solo afecta a este bot (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['setmoneda']
handler.tags = ['owner']
handler.command = ['setmoneda', 'setcurrency', 'moneda']
handler.owner = true

export default handler
