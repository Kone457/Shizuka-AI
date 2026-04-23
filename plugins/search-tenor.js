import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('《✧》 Ingresa una palabra clave para buscar GIFs en Tenor.')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })

    const res = await fetch(`${api.url}/search/tenor?q=${encodeURIComponent(text)}&limit=5&apikey=${api.key}`)
    const json = await res.json()

    if (!json.status || !json.result?.results?.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('《✧》 No se encontraron resultados.')
    }

    const results = json.result.results

    for (let gif of results) {
      await conn.sendMessage(m.chat, { 
        video: { url: gif.url }, 
        gifPlayback: true,
        caption: `🎬 *${gif.title}*`
      }, { quoted: m })
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
