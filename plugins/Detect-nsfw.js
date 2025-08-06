import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const emoji = '🔞'
  const kawaii = '💮'
  const rwait = '⏳'
  const done = '✅'
  const error = '❌'

  await m.react(rwait)

  // Si hay texto con una URL directa, úsalo
  let imageUrl = text?.trim()

  // Si no hay URL, intenta detectar imagen del mensaje citado o directo
  if (!imageUrl) {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime || !/image|video/.test(mime)) {
      await m.react(error)
      return conn.reply(m.chat, `${emoji} *Responde a una imagen o envía una URL para analizar contenido NSFW.*`, m)
    }

    try {
      let media = await q.download()
      let isImage = /image\/(png|jpe?g|gif)/.test(mime)
      let link = await (isImage ? uploadImage : uploadFile)(media)
      imageUrl = link
    } catch (e) {
      await m.react(error)
      return conn.reply(m.chat, `${error} *No se pudo subir la imagen.* Intenta con otra.`, m)
    }
  }

  try {
    const apiUrl = `https://delirius-apiofc.vercel.app/tools/checknsfw?image=${encodeURIComponent(imageUrl)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.data) {
      await m.react(error)
      return conn.reply(m.chat, `${error} *La API falló al procesar la imagen.*`, m)
    }

    const { NSFW, percentage, safe, response } = json.data

    const statusMsg = NSFW
      ? '🔞 *NSFW Detectado*'
      : '🟢 *Seguro*'

    const caption = `
*乂  S H I Z U K A - A I 乂*

${kawaii} *Resultado del Análisis NSFW*

${emoji} *NSFW:* ${NSFW ? 'Sí' : 'No'}
📈 *Porcentaje:* ${percentage}
🧼 *Seguro:* ${safe ? 'Sí' : 'No'}
🗣️ *Observación:* ${response}

📎 *Link escaneado:* ${imageUrl}
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption,
      contextInfo: {
        externalAdReply: {
          title: 'Detector NSFW por IA',
          body: 'Usa imágenes con responsabilidad',
          thumbnailUrl: imageUrl,
          sourceUrl: 'https://delirius-apiofc.vercel.app'
        }
      }
    }, { quoted: m })

    await m.react(done)

  } catch (e) {
    console.error(e)
    await m.react(error)
    return conn.reply(m.chat, `${error} *Ocurrió un error inesperado. Intenta nuevamente.*`, m)
  }
}

handler.command = /^checknsfw$/i
handler.help = ['checknsfw <url>']
handler.tags = ['tools', 'nsfw']
handler.premium = false

export default handler