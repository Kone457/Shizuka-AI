import { setBotConfig, getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text, args }) => {
  const cual = args[0]?.toLowerCase()

  if (!text || (cual !== '1' && cual !== '2')) {
    return m.reply(
      `✿ *Configurar Banner del Bot*\n\n` +
      `📌 *Uso:*\n` +
      `› .setbanner 1 <url> — Banner principal\n` +
      `› .setbanner 2 <url> — Banner secundario (menú)\n\n` +
      `📋 *Valores actuales de este bot:*\n` +
      `› Banner 1: ${getBotConfig(conn, 'banner')}\n` +
      `› Banner 2: ${getBotConfig(conn, 'banner2')}\n\n` +
      `💡 *Ejemplo:*\n` +
      `› .setbanner 1 https://i.imgur.com/ejemplo.jpg`
    )
  }

  const url = args.slice(1).join(' ').trim()
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return m.reply(`❌ Debes proporcionar una URL válida que empiece con http:// o https://`)
  }

  if (cual === '1') {
    const anterior = getBotConfig(conn, 'banner')
    setBotConfig(conn, 'banner', url)
    await conn.sendMessage(m.chat, {
      image: { url },
      caption:
        `✅ *Banner 1 actualizado para este bot*\n\n` +
        `› Anterior: ${anterior}\n` +
        `› Nuevo: ${url}\n\n` +
        `> Solo afecta a este bot (${conn.user.jid.split('@')[0]})`
    }, { quoted: m })
  } else {
    const anterior = getBotConfig(conn, 'banner2')
    setBotConfig(conn, 'banner2', url)
    await conn.sendMessage(m.chat, {
      image: { url },
      caption:
        `✅ *Banner 2 actualizado para este bot*\n\n` +
        `› Anterior: ${anterior}\n` +
        `› Nuevo: ${url}\n\n` +
        `> Solo afecta a este bot (${conn.user.jid.split('@')[0]})`
    }, { quoted: m })
  }
}

handler.help = ['setbanner']
handler.tags = ['owner']
handler.command = ['setbanner', 'banner']
handler.owner = true

export default handler
