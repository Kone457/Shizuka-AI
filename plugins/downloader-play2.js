import yts from 'yt-search';
import fetch from 'node-fetch';
import { getBuffer } from '../lib/message.js';
import sharp from 'sharp';

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('🌸 *Shizuka AI:*\n> Por favor, indícame qué video deseas visualizar.')
      }

      const query = args.join(' ')
      let url, title, thumbBuffer, videoData

      if (!isYTUrl(query)) {
        const search = await yts(query)
        if (!search.all.length) return m.reply('🥀 *Lo siento,*\n> no encontré resultados para tu búsqueda.')
        videoData = search.all[0]
        url = videoData.url
      } else {
        const videoId = query.split('v=')[1] || query.split('/').pop()
        const search = await yts({ videoId })
        videoData = search
        url = query
      }

      title = videoData.title
      thumbBuffer = await getBuffer(videoData.image || videoData.thumbnail)

      const vistas = (videoData.views || 0).toLocaleString()
      const canal = videoData.author?.name || 'YouTube'

      let infoMessage = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨\n\n`
      infoMessage += `🎬 *Tu video se está preparando*\n\n`
      infoMessage += `• 🏷️ *Título:* ${title}\n`
      infoMessage += `• 🎙️ *Canal:* ${canal}\n`
      infoMessage += `• ⏳ *Duración:* ${videoData.timestamp || 'N/A'}\n`
      infoMessage += `• 👀 *Vistas:* ${vistas}\n\n`
      infoMessage += `> 💎 *Enviando contenido, espera un momento...*`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

      const res = await fetch(`${api.url}/download/y2?url=${encodeURIComponent(url)}`)
      const result = await res.json()

      if (!result.status || !result.result || !result.result.url) {
        return m.reply('🥀 *Ups,*\n> hubo un pequeño fallo al procesar el video.')
      }

      const { url: videoUrl } = result.result
      const videoBuffer = await getBuffer(videoUrl)
      
      const thumb300 = await sharp(thumbBuffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer();

      await client.sendMessage(m.chat, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        jpegThumbnail: thumb300,
        caption: `🎬 *${title}*`
      }, { quoted: m });

    } catch (e) {
      console.error(e)
      await m.reply('🥀 *Shizuka AI:*\n> Ha ocurrido un error inesperado al procesar el video.')
    }
  }
};
