import { setBotConfig, getBotConfig } from '../lib/botconfig.js'
import uploadImage from '../lib/uploadImage.js'

let handler = async (m, { conn, text }) => {
  if (!text && !m.quoted) {
    return conn.sendMessage(m.chat, {
      image: { url: getBotConfig(conn, 'icon') },
      caption:
        `✿ *Configurar Ícono del Bot*\n\n` +
        `📌 *Uso:* .seticon <url>\n` +
        `› También puedes responder a una imagen con .seticon\n\n` +
        `📋 *Ícono actual de este bot:*\n` +
        `› ${getBotConfig(conn, 'icon')}\n\n` +
        `💡 *Ejemplo:*\n` +
        `› .seticon https://i.imgur.com/ejemplo.jpg`
    }, { quoted: m })
  }

  let url = text?.trim() || ''

  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    const quoted = m.quoted
    if (!quoted) {
      return m.reply(`❌ Debes proporcionar una URL válida o responder a una imagen.`)
    }
    const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || ''
    if (!/image/.test(mime)) {
      return m.reply(`❌ El mensaje citado no es una imagen.`)
    }
    await m.reply(`⏳ Subiendo imagen, espera un momento...`)
    try {
      const img = await quoted.download()
      url = await uploadImage(img)
    } catch (e) {
      return m.reply(`❌ Error al subir la imagen: ${e.message}`)
    }
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
