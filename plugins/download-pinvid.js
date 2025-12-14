let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: `⬛ Ingresa el link de un video/imagen de Pinterest.\nEjemplo:\n${usedPrefix + command} https://pin.it/abc123` },
      { quoted: m }
    )
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

    let apiUrl = `https://api.vreden.my.id/api/v1/download/pinterest?url=${encodeURIComponent(text)}`
    let response = await fetch(apiUrl)
    let data = await response.json()

    
    if (!data?.status || !data?.result) {
      throw new Error('La API no devolvió datos válidos.')
    }

    
    let mediaArray = data.result.media_urls
    let bestQualityMedia = mediaArray.find(m => m.quality === 'original') || mediaArray[0]

    if (!bestQualityMedia?.url) {
      throw new Error('No se encontró un enlace de descarga en la respuesta.')
    }

    
    await conn.sendFile(
      m.chat,
      bestQualityMedia.url, // URL del recurso
      `pinterest.${bestQualityMedia.type === 'video' ? 'mp4' : 'jpg'}`, // Nombre dinámico
      `⬛ Título: ${data.result.title || 'Sin título'}\n⬛ Subido por: ${data.result.uploader?.full_name || 'Desconocido'}`,
      m
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error('Error Pinterest:', e)
    await conn.sendMessage(
      m.chat,
      { text: `⬛ Error al procesar el link.\n⬛ Detalles: ${e.message}` },
      { quoted: m }
    )
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.help = ['pinvid *<link>*']
handler.tags = ['descargas']
handler.command = ['pinvideo', 'pinvid', 'pindl']
handler.premium = false
handler.group = true

export default handler