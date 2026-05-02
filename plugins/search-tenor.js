
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('《✧》 Ingresa una palabra clave para buscar GIFs en Tenor.')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })

    const res = await fetch(`${api.url}/search/tenor?q=${encodeURIComponent(text)}&limit=5&apikey=${api.key}`)
    const json = await res.json()
    const results = json.result?.results

    if (!json.status || !results || results.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('《✧》 No se encontraron resultados.')
    }

    for (let gif of results) {
      let url = gif.url
      if (url.endsWith('.gif')) {
        url = url.replace('.gif', '.mp4')
      }

      await conn.sendMessage(m.chat, { 
        video: { url: url }, 
        gifPlayback: true,
        caption: `🎬 *${gif.title || 'GIF'}*`
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
