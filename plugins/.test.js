import fetch from 'node-fetch'

async function getHolaGif() {

  const params = new URLSearchParams({
    key: 'AIzaSyC-P6_qz3FzCoXGLk6tgitZo4jEJ5mLzD8',
    client_key: 'tenor_web',
    locale: 'es_US',
    q: 'anime wave hello',
    limit: '25',
    contentfilter: 'low',
    media_filter: 'tinymp4,mp4'
  })

  const url = `https://tenor.googleapis.com/v2/search?${params.toString()}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Android 13)' }
  })

  const json = await res.json()

  const list = (json.results || [])
    .map(r =>
      r.media_formats?.tinymp4?.url ||
      r.media_formats?.mp4?.url
    )
    .filter(Boolean)

  if (!list.length) return null

  return list[Math.floor(Math.random() * list.length)]
}

export default {
  command: ['hola', 'hello', 'hi'],
  category: 'anime',

  run: async (client, m) => {

    const fromName = global.db.data.users[m.sender]?.name || 'Alguien'

    try {

      const result = await getHolaGif()

      if (!result) {
        return client.reply(m.chat, '✐ No se pudo obtener un gif', m)
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: result },
          gifPlayback: true,
          caption: `👋 ${fromName} saluda 🕷️`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
    }
  }
}