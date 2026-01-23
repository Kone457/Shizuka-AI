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

    let encodedUrl = encodeURIComponent(text)
    let apiUrl = `https://nexevo.onrender.com/download/pinterest?url=${encodedUrl}`
    
    let response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`)
    }
    
    let data = await response.json()

    if (!data?.status || !data?.result?.dl) {
      throw new Error('La API no devolvió datos válidos')
    }

    let downloadUrl = data.result.dl
    let urlLower = downloadUrl.toLowerCase()
    let isVideo = urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.mov')
    let fileName = `pinterest_download.${isVideo ? 'mp4' : 'jpg'}`

    await conn.sendFile(m.chat, downloadUrl, fileName, '', m)

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