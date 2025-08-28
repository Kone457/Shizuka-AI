const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🔍 Ingresa una búsqueda para obtener imágenes.\nEjemplo: ${usedPrefix + command} waifu`, m)

  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/search/anime-pictures?q=${encodeURIComponent(text)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    })

    const json = await res.json()

    if (!json.status || !json.data.length) {
      return conn.reply(m.chat, `❌ No se encontraron imágenes para: *${text}*`, m)
    }

    for (const url of json.data) {
      await conn.sendMessage(m.chat, {
        image: { url },
        caption: `🎴 *Búsqueda:* ${text}`,
        footer: '🌸 Imagen ritualizada desde Delirius API',
        contextInfo: {
          externalAdReply: {
            title: 'Anime Pictures',
            body: 'Miniatura ceremonial generada',
            thumbnailUrl: url,
            sourceUrl: url
          }
        }
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, `⚠️ Error al obtener imágenes: ${e.message}`, m)
  }
}

handler.command = ['anime', 'ritualanimefull']
handler.help = ['anime <búsqueda>']
handler.tags = ['rituales', 'canvas']
handler.register = true
handler.group = false
handler.premium = false

export default handler