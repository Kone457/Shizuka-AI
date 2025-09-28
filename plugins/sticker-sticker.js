/*───────────────────────────────────────
  📁 Módulo:     sticker.js
  🧠 Autor:      Carlos
  🛠 Proyecto:   Shizuka-AI
  🔗 GitHub:     https://github.com/Kone457/Shizuka-AI
───────────────────────────────────────*/

import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
  let stiker = false
  const thumbnailCard = 'https://qu.ax/phgPU.jpg' // Miniatura usada en la tarjeta

  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/webp|image|video/g.test(mime)) {
      if (/video/.test(mime) && (q.msg || q).seconds > 15) {
        return m.reply('⏱️ El video no puede superar los 15 segundos. Intenta con algo más corto.')
      }

      const media = await q.download?.()
      if (!media) {
        return m.reply('🖼️ Necesito una imagen, video o sticker para convertirlo. ¡Envíame algo bonito!')
      }

      let out
      const userData = global.db.data.users[m.sender] || {}
      const texto1 = userData.text1 || global.packsticker
      const texto2 = userData.text2 || global.packsticker2

      try {
        stiker = await sticker(media, false, texto1, texto2)
      } finally {
        if (!stiker) {
          if (/webp/.test(mime)) out = await webp2png(media)
          else if (/image/.test(mime)) out = await uploadImage(media)
          else if (/video/.test(mime)) out = await uploadFile(media)
          if (typeof out !== 'string') out = await uploadImage(media)
          stiker = await sticker(false, out, texto1, texto2)
        }
      }

    } else if (args[0]) {
      if (isUrl(args[0])) {
        stiker = await sticker(false, args[0], texto1, texto2)
      } else {
        return m.reply('🔗 El enlace no parece válido. Asegúrate de que termine en .jpg, .png o .gif.')
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    } else {
      await conn.sendMessage(m.chat, {
        text: '💌 Aún no he podido generar tu sticker. Intenta nuevamente con una imagen o video.',
        footer: '🎨 Generador automático de stickers',
        contextInfo: {
          externalAdReply: {
            title: 'No se pudo generar el sticker',
            body: 'Envíame una imagen o video para convertir',
            thumbnailUrl: thumbnailCard,
            sourceUrl: thumbnailCard
          }
        }
      }, { quoted: m })
    }
  }
}

handler.help = ['sticker <imagen|url>']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

const isUrl = (text = '') => {
  const regex = /^https?:\/\/[^ ]+\.(jpe?g|png|gif)$/i
  return regex.test(text)
}