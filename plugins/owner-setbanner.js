import { setBotConfig, getBotConfig } from '../lib/botconfig.js'
import uploadImage from '../lib/uploadImage.js'

async function getUrlFromMessage(m) {
  const urlFromArgs = null
  const q = m.quoted ? m.quoted : null
  if (q) {
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (/image/.test(mime)) {
      const img = await q.download()
      if (img) {
        const url = await uploadImage(img)
        return url
      }
    }
  }
  return urlFromArgs
}

let handler = async (m, { conn, text, args }) => {
  const cual = args[0]?.toLowerCase()

  if (!text && !m.quoted) {
    return m.reply(
      `✿ *Configurar Banner del Bot*\n\n` +
      `📌 *Uso:*\n` +
      `› .setbanner 1 <url> — Banner principal\n` +
      `› .setbanner 2 <url> — Banner secundario (menú)\n` +
      `› También puedes responder a una imagen con .setbanner 1 o .setbanner 2\n\n` +
      `📋 *Valores actuales de este bot:*\n` +
      `› Banner 1: ${getBotConfig(conn, 'banner')}\n` +
      `› Banner 2: ${getBotConfig(conn, 'banner2')}\n\n` +
      `💡 *Ejemplo:*\n` +
      `› .setbanner 1 https://i.imgur.com/ejemplo.jpg`
    )
  }

  if (cual !== '1' && cual !== '2') {
    return m.reply(`❌ Indica qué banner cambiar: *.setbanner 1* o *.setbanner 2*`)
  }

  let url = args.slice(1).join(' ').trim()

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
