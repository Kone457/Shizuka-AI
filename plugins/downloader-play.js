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
        return m.reply('✨ *Uso correcto:* Escribe el nombre o pega el link de un video para descargar su audio.')
      }

      const query = args.join(' ')
      let url, title, thumbBuffer, videoData

      if (!isYTUrl(query)) {
        const search = await yts(query)
        if (!search.all.length) {
          return m.reply('❌ No encontré resultados para tu búsqueda.')
        }
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

      // --- DISEÑO AVANZADO DE MENSAJE ---
      const vistas = (videoData.views || 0).toLocaleString()
      const canal = videoData.author?.name || 'YouTube'
      
      let infoMessage = `╔════════════════════╗\n`
      infoMessage += `║   🎵 **YOUTUBE PLAY** ║\n`
      infoMessage += `╚════════════════════╝\n\n`
      
      infoMessage += `╔▣ **INFORMACIÓN DEL AUDIO**\n`
      infoMessage += `┃ ◈ *Título:* ${title}\n`
      infoMessage += `┃ ◈ *Canal:* ${canal}\n`
      infoMessage += `┃ ◈ *Duración:* ${videoData.timestamp || 'N/A'}\n`
      infoMessage += `┃ ◈ *Vistas:* ${vistas}\n`
      infoMessage += `┃ ◈ *Estado:* ✅ Extrayendo...\n`
      infoMessage += `╚════════════════════\n\n`
      
      infoMessage += `> ⏳ *Enviando audio como archivo, por favor espere...*`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

      let result
      try {
        const res = await fetch(`${api.url}/download/y?url=${encodeURIComponent(url)}`)
        result = await res.json()
        
        if (!result.status || !result.result || !result.result.url) {
          return m.reply('❌ No se pudo extraer el audio del servidor.')
        }
      } catch {
        return m.reply('⚠️ Error en la API de descarga.')
      }

      const { url: audioUrl, info } = result.result
      const audioTitle = info?.title || title || 'Audio'
      const audioBuffer = await getBuffer(audioUrl)
      
      const thumb300 = await sharp(thumbBuffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer();

      await client.sendMessage(m.chat, {
        document: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${audioTitle}.mp3`,
        jpegThumbnail: thumb300
      }, { quoted: m });

    } catch (e) {
      console.error(e)
      await m.reply('❌ Ocurrió un fallo crítico al procesar la descarga.')
    }
  }
};
