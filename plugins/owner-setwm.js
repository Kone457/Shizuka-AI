import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *Configurar Marca de Agua (Stickers)*\n\n` +
      `📌 *Uso:* .setwm <texto>\n\n` +
      `📋 *Valor actual de este bot:* *${getBotConfig(conn, 'wm')}*\n\n` +
      `💡 *Ejemplos:*\n` +
      `› .setwm MiBot\n` +
      `› .setwm © Shizuka-AI`
    )
  }

  const nuevoWm = text.trim()
  const anterior = getBotConfig(conn, 'wm')

  setBotConfig(conn, 'wm', nuevoWm)

  await m.reply(
    `✅ *Marca de agua actualizada para este bot*\n\n` +
    `› Anterior: *${anterior}*\n` +
    `› Nueva: *${nuevoWm}*\n\n` +
    `> Solo afecta a este bot (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['setwm']
handler.tags = ['owner']
handler.command = ['setwm', 'watermark']
handler.owner = true

export default handler
