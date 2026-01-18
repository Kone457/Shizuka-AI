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

    // API principal: ananta.qzz.io
    let response = await fetch('https://api.ananta.qzz.io/api/pinvid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'ant92t92tu6it' // tu API key
      },
      body: JSON.stringify({ url: text })
    })

    let data = await response.json()

    if (!data?.status || !data?.result) {
      throw new Error('La API no devolvió datos válidos')
    }

    let result = data.result
    let downloadUrl = result.video?.formats?.mp4 || result.url
    let isVideo = !!result.video?.formats?.mp4
    let fileName = `pinterest_download.${isVideo ? 'mp4' : 'jpg'}`
    let fileType = isVideo ? 'video' : 'imagen'

    let caption = `⬛ *Pinterest ${fileType} descargado*\n` +
                  `📝 ${result.info?.title || 'Sin título'}\n` +
                  `👤 ${result.user?.fullName || result.user?.username || 'Desconocido'}\n` +
                  `💾 Guardados: ${result.stats?.saves || 0}\n` +
                  `🔗 ${text}`

    await conn.sendFile(m.chat, downloadUrl, fileName, caption, m)

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