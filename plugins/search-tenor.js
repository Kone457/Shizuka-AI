import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('《✧》 Ingresa una palabra clave para buscar GIFs en Tenor.')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })

    const res = await fetch(`${api.url}/search/tenor?q=${encodeURIComponent(text)}&limit=5&apikey=${api.key}`)
    const json = await res.json()
    const results = json.result?.results || json.result

    if (!json.status || !results || results.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('《✧》 No se encontraron resultados.')
    }

    for (let gif of results) {
      const media = gif.media_formats?.mp4?.url || gif.media_formats?.tinymp4?.url || gif.url

      if (media && media.includes('http')) {
        await conn.sendMessage(m.chat, { 
          video: { url: media }, 
          gifPlayback: true,
          caption: `🎬 *${gif.title || 'GIF'}*`
        }, { quoted: m })
      }
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['tenor']
handler.tags = ['buscadores']
handler.command = ['tenor', 'gif']

export default handler
