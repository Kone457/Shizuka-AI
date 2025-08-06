import fetch from 'node-fetch'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const emoji = '🔞'
  const kawaii = '💮'
  const error = '❌'

  // Primero intenta obtener URL desde texto
  let imageUrl = text && text.trim()

  // Si no hay texto, busca si enviaron una imagen directamente (m.message.imageMessage)
  if (!imageUrl && m.message.imageMessage) {
    // Obtener URL temporal del mensaje (descarga la imagen primero)
    try {
      const stream = await conn.downloadMedia(m)
      // Aquí debes subir la imagen a un host público o directamente analizar localmente,
      // pero la API que usas requiere URL pública, así que necesitas subir la imagen antes.
      // Como subir no está contemplado, le indicaremos al usuario que envíe URL.
      return conn.reply(m.chat, `${error} Lo siento, actualmente solo puedo analizar imágenes enviadas como URL pública. Por favor envía una URL de imagen.`, m)
    } catch {
      return conn.reply(m.chat, `${error} No pude descargar la imagen. Intenta enviar una URL válida.`, m)
    }
  }

  if (!imageUrl || !imageUrl.startsWith('http')) {
    return conn.reply(m.chat, `👀 *Debes proporcionar una URL de imagen para analizar.*\n\n📸 *Ejemplo:* ${usedPrefix + command} https://i.postimg.cc/3wkL5vtn/13.jpg`, m)
  }

  try {
    const apiUrl = `https://delirius-apiofc.vercel.app/tools/checknsfw?image=${encodeURIComponent(imageUrl)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status) {
      return conn.reply(m.chat, '⚠️ No se pudo analizar la imagen. Vuelve a intentarlo.', m)
    }

    const { NSFW, percentage, safe, response } = json.data

    const result = NSFW
      ? '🔞 *Contenido NSFW detectado*'
      : '✅ *Imagen segura*'

    const caption = `
🧠 *Shizuka-AI NSFW Detector*

🖼️ *Imagen Analizada*
📊 *Resultado:* ${result}
📈 *Porcentaje:* ${percentage}
🔐 *Seguro:* ${safe ? 'Sí' : 'No'}
📝 *Observación:* ${response}

🧬 *API:* Delirius NSFW Detector
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption,
      footer: 'Shizuka-AI 💮',
      contextInfo: {
        externalAdReply: {
          title: "Detector NSFW por IA",
          body: "Usa imágenes con responsabilidad",
          thumbnailUrl: imageUrl,
          sourceUrl: 'https://delirius-apiofc.vercel.app'
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('Error en NSFW Plugin:', e)
    return conn.reply(m.chat, '❌ Error al analizar la imagen. Asegúrate de que el enlace sea válido y vuelve a intentarlo.', m)
  }
}

handler.help = ['checknsfw <url_imagen>']
handler.tags = ['tools', 'nsfw']
handler.command = /^checknsfw$/i
handler.premium = false

export default handler