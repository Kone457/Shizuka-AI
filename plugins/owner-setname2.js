import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `✿ *Configurar Nombre Completo del Bot*\n\n` +
      `📌 *Uso:* .setname2 <nombre completo>\n\n` +
      `📋 *Valor actual de este bot:*\n` +
      `› Nombre completo: *${getBotConfig(conn, 'namebot')}*\n\n` +
      `💡 *Ejemplo:* .setname2 Shizuka-AI`
    )
  }

  const nuevoNombre = text.trim()
  const anterior = getBotConfig(conn, 'namebot')

  setBotConfig(conn, 'namebot', nuevoNombre)

  await m.reply(
    `✅ *Nombre completo actualizado para este bot*\n\n` +
    `› Anterior: *${anterior}*\n` +
    `› Nuevo: *${nuevoNombre}*\n\n` +
    `> Solo afecta a este bot (${conn.user.jid.split('@')[0]})`
  )
}

handler.help = ['setname2']
handler.tags = ['owner']
handler.command = ['setname2', 'setnombrebot']
handler.owner = true

export default handler
