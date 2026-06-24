import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *Configurar Pack de Stickers*\n\n` +
      `📌 *Uso:* .setpack <nombre del pack>\n\n` +
      `📋 *Valor actual de este bot:* *${getBotConfig(conn, 'packname')}*\n\n` +
      `💡 *Ejemplos:*\n` +
      `› .setpack MiPack\n` +
      `› .setpack Stickers de MiBot`
    )
  }

  const nuevoPack = text.trim()
  const anterior = getBotConfig(conn, 'packname')

  setBotConfig(conn, 'packname', nuevoPack)

  await m.reply(
    `✅ *Pack de stickers actualizado para este bot*\n\n` +
    `› Anterior: *${anterior}*\n` +
    `› Nuevo: *${nuevoPack}*\n\n` +
    `> Solo afecta a este bot (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['setpack']
handler.tags = ['owner']
handler.command = ['setpack', 'packname']
handler.owner = true

export default handler
