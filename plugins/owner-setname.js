import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *Configurar Nombre del Bot*\n\n` +
      `📌 *Uso:* .setname <nuevo nombre>\n\n` +
      `📋 *Valores actuales de este bot:*\n` +
      `› Nombre corto: *${getBotConfig(conn, 'botname')}*\n` +
      `› Nombre completo: *${getBotConfig(conn, 'namebot')}*\n\n` +
      `💡 *Ejemplos:*\n` +
      `› .setname MiBot\n` +
      `› .setname2 MiBot-AI _(para el nombre completo)_`
    )
  }

  const nuevoNombre = text.trim()
  const anterior = getBotConfig(conn, 'botname')

  setBotConfig(conn, 'botname', nuevoNombre)
  setBotConfig(conn, 'namebot', nuevoNombre)

  await m.reply(
    `✅ *Nombre actualizado para este bot*\n\n` +
    `› Anterior: *${anterior}*\n` +
    `› Nuevo: *${nuevoNombre}*\n\n` +
    `> Solo afecta a este bot (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['setname']
handler.tags = ['owner']
handler.command = ['setname', 'setnombre']
handler.owner = true

export default handler
