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

    let ouh = await fetch(`https://api.agatz.xyz/api/pinterest?url=${encodeURIComponent(text)}`)
    let gyh = await ouh.json()

    if (!gyh?.data?.result) throw new Error('No se pudo obtener el recurso')

    await conn.sendFile(
      m.chat,
      gyh.data.result,
      'pinvideobykeni.mp4',
      `⬛ Url: ${gyh.data.url}`,
      m
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error('Error Pinterest:', e)
    await conn.sendMessage(
      m.chat,
      { text: `⬛ Error.\n⬛ Detalles: ${e.message}` },
      { quoted: m }
    )
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.help = ['pinvid *<link>*']
handler.tags = ['descargas']
handler.command = ['pinvideo', 'pinvid']
handler.premium = false
handler.group = true

export default handler