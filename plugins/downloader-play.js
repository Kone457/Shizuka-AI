import yts from 'yt-search'
import axios from 'axios'
import { getBuffer } from '../lib/message.js'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

async function getAudio(url) {
  try {
    const res = await axios.get(
      `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    )
    if (res.data?.status && res.data?.result?.mp3) {
      return res.data.result
    }
    throw new Error("API_FAILED")
  } catch (e) {
    throw new Error("API_FAILED")
  }
}

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',

  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('🌸 Shizuka AI: \n> Por favor, dame el título o link de la canción que deseas escuchar.')
      }

      const query = args.join(' ')
      let url, title, thumbUrl, vistas, canal, duracion, videoData

      if (!isYTUrl(query)) {
        const search = await yts(query)
        if (!search.all.length) return m.reply('🥀 Lo siento, \n> no encontré resultados para esa búsqueda.')
        
        videoData = search.all[0]
        url = videoData.url
        title = videoData.title
        thumbUrl = videoData.image || videoData.thumbnail
        vistas = (videoData.views || 0).toLocaleString()
        canal = videoData.author?.name || 'YouTube'
        duracion = videoData.timestamp || 'N/A'
      } else {
        url = query
      }

      const data = await getAudio(url)

      if (isYTUrl(query)) {
        title = data.title
        thumbUrl = data.thumbnail
        duracion = data.duration || 'N/A'
        canal = 'YouTube'
        vistas = 'N/A'
      }

      let infoMessage = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨\n\n`
      infoMessage += `🎵 Audio preparado con delicadeza\n\n`
      infoMessage += `• 🏷️ Título: ${title}\n`
      infoMessage += `• 🎙️ Canal: ${canal}\n`
      infoMessage += `• ⏳ Duración: ${duracion}\n`
      infoMessage += `• 👀 Vistas: ${vistas}\n\n`
      infoMessage += `> 💎 Enviando tu música, espera un instante...`

      const thumbBuffer = await getBuffer(thumbUrl)
      await client.sendMessage(
        m.chat,
        { image: thumbBuffer, caption: infoMessage },
        { quoted: m }
      )

      const audioBuffer = await getBuffer(data.mp3)
      await client.sendMessage(
        m.chat,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply('🥀 Shizuka AI: \n> Hubo un fallo inesperado al procesar tu solicitud.')
    }
  }
}
