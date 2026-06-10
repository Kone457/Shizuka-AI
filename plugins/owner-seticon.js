import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      image: { url: getBotConfig(conn, 'icon') },
      caption:
        `✿ *Configurar Ícono del Bot*\n\n` +
        `📌 *Uso:* .seticon <url>\n\n` +
        `📋 *Ícono actual de este bot:*\n` +
        `› ${getBotConfig(conn, 'icon')}\n\n` +
        `💡 *Ejemplo:*\n` +
        `› .seticon https://i.imgur.com/ejemplo.jpg`
    }, { quoted: m })
  }

  const url = text.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return m.reply(`❌ Debes proporcionar una URL válida que empiece con http:// o https://`)
  }

  const anterior = getBotConfig(conn, 'icon')
  setBotConfig(conn, 'icon', url)

  await conn.sendMessage(m.chat, {
    image: { url },
    caption:
      `✅ *Ícono actualizado para este bot*\n\n` +
      `› Anterior: ${anterior}\n` +
      `› Nuevo: ${url}\n\n` +
      `> Solo afecta a este bot (${conn.user.jid.split('@')[0]})`
  }, { quoted: m })
}

handler.help = ['seticon']
handler.tags = ['owner']
handler.command = ['seticon', 'icono']
handler.owner = true

export default handler
