import fetch from 'node-fetch'

const isUrl = (text) => /^https?:\/\/[^\s]+$/i.test(text)

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, '《✧》 Ingresa un enlace válido.', m)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let video
    let text = '✿ Aquí tienes.'

    if (isUrl(args[0])) {
      const res = await fetch(
        `${api.url}/download/tiktok?url=${encodeURIComponent(args[0])}&apikey=${api.key}`
      )
      const json = await res.json()

      if (!json.status || !json.result) {
        throw new Error('No se pudo obtener el video')
      }

      video = json.result.play || json.result.hdplay
    } else {
      const query = args.join(' ')
      const res = await fetch(
        `${api.url}/search/tiktok?q=${encodeURIComponent(query)}&apikey=${api.key}`
      )
      const json = await res.json()

      if (!json.status || !json.result?.length) {
        throw new Error('No se pudo obtener el video')
      }

      video = json.result[0].play
    }

    if (!video) throw new Error('No se pudo obtener el video')

    await conn.sendFile(m.chat, video, 'tiktok.mp4', text, m)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    await conn.reply(m.chat, `❏ Error.\n❏ Detalles: ${e.message}`, m)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.command = ['tiktok', 'tt']
handler.tags = ['descargas']
handler.help = ['tiktok']
handler.group = true

export default handler