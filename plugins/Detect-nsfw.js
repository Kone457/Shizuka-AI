import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🔞'
  const sparkle = '✨'
  const flower = '🌸'
  const error = '❌'
  const ai = '🤖'
  const kawaii = '💖'

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} ¡Oh~! Falta la URL de la imagen senpai~\n${paperclip || '📎'} Uso: *${usedPrefix + command} <url>*`, m)
  }

  const imageUrl = args[0]
  await conn.reply(m.chat, `${ai} Shizuka‑AI está analizando tu imagen... por favor espera ${flower}`, m)

  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/tools/checknsfw?image=${encodeURIComponent(imageUrl)}`)
    const json = await res.json()
    if (!json.status) {
      throw new Error('La API devolvió estado falso')
    }

    const nsfw = json.data.NSFW
    const percentage = json.data.percentage
    const safe = json.data.safe
    const response = json.data.response

    let verdict = safe
      ? `${kawaii} ¡La imagen parece *segura para el trabajo*!`
      : `${emoji} Esta imagen fue detectada como *NSFW* (${percentage})`

    const caption = `
${verdict}
💧 Confianza: *${percentage}*
🧿 NSFW: *${nsfw ? 'Sí' : 'No'}*
✅ Safe: *${safe ? 'Sí' : 'No'}*

🗣️ Mensaje del sistema: "${response}"
`

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption,
      footer: `Shizuka-AI analizadora de imágenes ${sparkle}`,
      contextInfo: {
        externalAdReply: {
          title: 'NSFW Check',
          body: nsfw ? 'Cuidado al compartir~' : 'Segura para compartir',
          thumbnailUrl: imageUrl,
          sourceUrl: imageUrl
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, `${error} Uhm~ ocurrió un error al procesar la imagen...\n🔧 Detalles: *${e.message}*`, m)
  }
}

handler.command = ['checknsfw', 'nsfwcheck', 'analizarnsfw']
handler.help = ['checknsfw <url de imagen>']
handler.tags = ['nsfw', 'utility']
handler.register = true
handler.group = false
handler.premium = false

export default handler