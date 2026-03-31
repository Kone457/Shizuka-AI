import fetch from 'node-fetch';
import { getBuffer } from '../lib/message.js';

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
      let url, title, thumbBuffer, duration = 'N/A', canal = 'YouTube', vistas = 'N/A'

      if (!isYTUrl(query)) {
        const res = await fetch(`${api.url}/search/youtube?q=${encodeURIComponent(query)}&apikey=${api.key}`)
        const json = await res.json()

        if (!json.status || !json.result || !json.result.length) {
          return m.reply('🥀 *Lo siento,* \n> no encontré resultados para esa búsqueda.')
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
          return m.reply('🥀 *Lo siento,* \n> no encontré resultados para esa búsqueda.')
        }

        const videoData = json.result[0]
        url = query
        title = videoData.title
        duration = videoData.duration
        canal = videoData.channel
        thumbBuffer = await getBuffer(videoData.imageUrl)
      }

      let infoMessage = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨\n\n`
      infoMessage += `🎵 *Audio preparado con delicadeza*\n\n`
      infoMessage += `• 🏷️ *Título:* ${title}\n`
      infoMessage += `• 🎙️ *Canal:* ${canal}\n`
      infoMessage += `• ⏳ *Duración:* ${duration}\n`
      infoMessage += `• 👀 *Vistas:* ${vistas}\n\n`
      infoMessage += `> 💎 *Enviando tu música, espera un instante...*`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

      const res2 = await fetch(`${api.url}/download/audio?url=${encodeURIComponent(url)}&apikey=${api.key}`)
      const result = await res2.json()

      if (!result.status || !result.result || !result.result.url) {
        return m.reply('🥀 *Ups,* \n> hubo un pequeño problema técnico al extraer el audio.')
      }

      const audioBuffer = await getBuffer(result.result.url)

      await client.sendMessage(m.chat, {  
        audio: audioBuffer,  
        mimetype: 'audio/mpeg',  
        ptt: false,   
        fileName: `${title}.mp3`  
      }, { quoted: m });

    } catch (e) {
      console.error(e)
      await m.reply('🥀 *Shizuka AI:* \n> Hubo un fallo inesperado al procesar tu solicitud.')
    }
  }
};