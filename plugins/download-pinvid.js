import fetch from 'node-fetch'

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

    
    const apiKey = 'rmF1oUJI529jzux8'
    
    
    let apiUrl = `https://api-nv.ultraplus.click/api/video/dl/pinterest?url=${encodeURIComponent(text)}&key=${apiKey}`
    console.log('Consultando API:', apiUrl)
    
    let response = await fetch(apiUrl)
    let data = await response.json()

    if (!data?.status || !data?.result) {
      throw new Error('La API no devolvió datos válidos')
    }

    let downloadUrl = data.result.video_url || data.result.image_url
    
    if (!downloadUrl) {
      throw new Error('No se encontró contenido para descargar')
    }

    let isVideo = data.result.video_url ? true : false
    let fileName = `pinterest_download.${isVideo ? 'mp4' : 'jpg'}`
    let fileType = isVideo ? 'video' : 'imagen'

    await conn.sendFile(
      m.chat,
      downloadUrl,
      fileName,
      `⬛ Pinterest ${fileType} descargado\n⬛ Original: ${data.result.original_url}`,
      m
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error('Error Pinterest:', e)
    await conn.sendMessage(
      m.chat,
      { text: `⬛ Error al procesar el link.\n⬛ Detalles: ${e.message}\n⬛ Verifica que el enlace sea público y válido.` },
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