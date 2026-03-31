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
      let url, title, thumbBuffer, duration = 'N/A', canal = 'YouTube', vistas = 'N/A'

      if (!isYTUrl(query)) {
        const res = await fetch(`${api.url}/search/youtube?q=${encodeURIComponent(query)}&apikey=${api.key}`)
        const json = await res.json()

        if (!json.status || !json.result || !json.result.length) {
          return m.reply('🥀 *Lo siento,*\n> no encontré resultados para tu búsqueda.')
        }

        const videoData = json.result[0]
        url = videoData.link
        title = videoData.title
        duration = videoData.duration
        canal = videoData.channel
        thumbBuffer = await getBuffer(videoData.imageUrl)
      } else {
        const res = await fetch(`${api.url}/search/youtube?q=${encodeURIComponent(query)}&apikey=${api.key}`)
        const json = await res.json()

        if (!json.status || !json.result || !json.result.length) {
          return m.reply('🥀 *Lo siento,*\n> no encontré resultados para tu búsqueda.')
        }

        const videoData = json.result[0]
        url = query
        title = videoData.title
        duration = videoData.duration
        canal = videoData.channel
        thumbBuffer = await getBuffer(videoData.imageUrl)
      }

      let infoMessage = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨\n\n`
      infoMessage += `🎬 *Tu video se está preparando*\n\n`
      infoMessage += `• 🏷️ *Título:* ${title}\n`
      infoMessage += `• 🎙️ *Canal:* ${canal}\n`
      infoMessage += `• ⏳ *Duración:* ${duration}\n`
      infoMessage += `• 👀 *Vistas:* ${vistas}\n\n`
      infoMessage += `> 💎 *Enviando contenido, espera un momento...*`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

      const res2 = await fetch(`${api.url}/download/video?url=${encodeURIComponent(url)}&apikey=${api.key}`)
      const result = await res2.json()

      if (!result.status || !result.result || !result.result.url) {
        return m.reply('🥀 *Ups,*\n> hubo un pequeño fallo al procesar el video.')
      }

      const videoBuffer = await getBuffer(result.result.url)

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