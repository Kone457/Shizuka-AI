import axios from 'axios'

const isUrl = (text) => /^https?:\/\/[^\s]+$/i.test(text)

const isTikTokUrl = (text) => {
  try {
    const { hostname } = new URL(text)

    return [
      'tiktok.com',
      'www.tiktok.com',
      'm.tiktok.com',
      'vt.tiktok.com',
      'vm.tiktok.com'
    ].includes(hostname)
  } catch {
    return false
  }
}

async function resolveTikTokUrl(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    return res.request?.res?.responseUrl || url
  } catch {
    return url
  }
}

const handler = async (m, { conn, args }) => {
  if (!args.length) {
    return conn.reply(
      m.chat,
      '《✧》 Ingresa un enlace o una búsqueda.',
      m
    )
  }

  await conn.sendMessage(m.chat, {
    react: {
      text: '⏳',
      key: m.key
    }
  })

  try {
    let video
    let text = '✿ Aquí tienes.'

    const query = args.join(' ')

    if (isUrl(query)) {
      if (!isTikTokUrl(query)) {
        throw new Error('El enlace no pertenece a TikTok.')
      }

      let url = query

      if (
        url.includes('vt.tiktok.com') ||
        url.includes('vm.tiktok.com')
      ) {
        url = await resolveTikTokUrl(url)
      }

      const res = await fetch(
        `${api.url}/download/tiktok?url=${encodeURIComponent(
          url
        )}&apikey=${api.key}`
      )

      const json = await res.json()

      if (!json.status || !json.result?.data) {
        throw new Error('No se pudo descargar el video.')
      }

      const data = json.result.data

      video =
        data.hdplay ||
        data.play ||
        data.wmplay

      text += `\n\n📝 ${data.title || 'Sin título'}`
    }

    else {
      const res = await fetch(
        `${api.url}/search/tiktok?q=${encodeURIComponent(
          query
        )}&apikey=${api.key}`
      )

      const json = await res.json()

      if (!json.status || !json.result?.length) {
        throw new Error(
          'No se encontró ningún video.'
        )
      }

      const first = json.result[0]

      const url = `https://www.tiktok.com/@${first.author.unique_id}/video/${first.video_id}`

      const dl = await fetch(
        `${api.url}/download/tiktok?url=${encodeURIComponent(
          url
        )}&apikey=${api.key}`
      )

      const data = await dl.json()

      if (!data.status || !data.result?.data) {
        throw new Error(
          'No se pudo descargar el resultado encontrado.'
        )
      }

      const result = data.result.data

      video =
        result.hdplay ||
        result.play ||
        result.wmplay

      text += `\n\n📝 ${result.title || 'Sin título'}`
    }

    if (!video) {
      throw new Error(
        'No se pudo obtener el archivo de video.'
      )
    }

    await conn.sendFile(
      m.chat,
      video,
      'tiktok.mp4',
      text,
      m
    )

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })
  } catch (e) {
    await conn.reply(
      m.chat,
      `❏ Error.\n❏ Detalles: ${e.message}`,
      m
    )

    await conn.sendMessage(m.chat, {
      react: {
        text: '⚠️',
        key: m.key
      }
    })
  }
}

handler.command = ['tiktok', 'tt']
handler.help = ['tiktok <url|texto>']
handler.tags = ['descargas']
handler.group = true

export default handler