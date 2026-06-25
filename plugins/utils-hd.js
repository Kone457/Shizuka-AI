import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, args }) => {
  const quoted = m.quoted ? m.quoted : null
  const mime = quoted?.mimetype || ''
  if (!mime || !mime.startsWith('image/')) {
    return conn.reply(m.chat, '⚠️ Responde a una *imagen* con el comando `.hd`.', m)
  }

  const img = await quoted.download()
  if (!img) return conn.reply(m.chat, '❌ No se pudo obtener la imagen.', m)

  try {
    const fd = new FormData()
    fd.append('image', img, { filename: 'input.jpg', contentType: 'image/jpeg' })

    const model = args[0] || ''
    const apiUrl = `${api.url}/ai/upscale?model=${encodeURIComponent(model)}&apikey=${api.key}`

    const resApi = await fetch(apiUrl, {
      method: 'POST',
      body: fd,
      headers: fd.getHeaders()
    })
    const result = await resApi.json()

    if (!result.ok) {
      return conn.reply(m.chat, `❌ Error: ${result.msg || 'No se pudo procesar la imagen'}`, m)
    }

    const txt = `*乂 H D - U P S C A L E R 乂*\n\n` +
                `*» Modelo* : ${result.model}\n` +
                `*» Upscaled* : ${result.upscaled}\n` +
                `*» Tiempo* : ${result.duration}s\n`

    await conn.sendFile(m.chat, result.upscaled, 'upscaled.jpg', txt, m)

  } catch (e) {
    conn.reply(m.chat, `❌ Error al conectar con la API: ${e.message}`, m)
  }
}

handler.help = ['hd']
handler.tags = ['tools']
handler.command = ['hd','upscale']

export default handler