import yts from 'yt-search';
import fetch from 'node-fetch';
import { getBuffer } from '../lib/message.js';
import sharp from 'sharp';

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('🌸 Shizuka AI: \n> Por favor, dame el título o link de la canción que deseas escuchar.')
      }

      const query = args.join(' ')
      let url, title, thumbBuffer, videoData

      if (!isYTUrl(query)) {
        const search = await yts(query)
        if (!search.all.length) {
          return m.reply('🥀 Lo siento, \n> no encontré resultados para esa búsqueda.')
        }
        videoData = search.all[0]
        url = videoData.url
      } else {
        const videoId = query.split('v=')[1]?.split('&')[0] || query.split('/').pop()
        const search = await yts({ videoId })
        videoData = search
        url = query
      }

      title = videoData.title
      const thumbUrl = videoData.image || videoData.thumbnail
      thumbBuffer = await getBuffer(thumbUrl)

      const vistas = (videoData.views || 0).toLocaleString()
      const canal = videoData.author?.name || 'YouTube'
      
      let infoMessage = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒜 𝒜𝐼 ── ✨\n\n`
      infoMessage += `🎵 Audio preparado con delicadeza\n\n`
      infoMessage += `• 🏷️ Título: ${title}\n`
      infoMessage += `• 🎙️ Canal: ${canal}\n`
      infoMessage += `• ⏳ Duración: ${videoData.timestamp || 'N/A'}\n`
      infoMessage += `• 👀 Vistas: ${vistas}\n\n`
      infoMessage += `> 💎 Enviando tu música, espera un instante...`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

      let result
      try {
        const res = await fetch(`${api.url3}/faa/ytmp3?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        
        if (!data.status || !data.result || !data.result.mp3) {
          return m.reply('🥀 Shizuka AI: \n> No se pudo extraer el audio del servidor.')
        }
        result = data.result
      } catch (e) {
        return m.reply('🥀 Shizuka AI: \n> Hubo un fallo inesperado al procesar tu solicitud.')
      }

      const audioBuffer = await getBuffer(result.mp3)
      
      const thumb300 = await sharp(thumbBuffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer();

      await client.sendMessage(m.chat, {
        document: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${result.title || title}.mp3`,
        jpegThumbnail: thumb300
      }, { quoted: m });

    } catch (e) {
      console.error(e)
      await m.reply('🥀 Shizuka AI: \n> Hubo un fallo inesperado al procesar tu solicitud.')
    }
  }
};
