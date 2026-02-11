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
        return m.reply('✨ *Uso correcto:* Escribe el nombre o pega el link de un video para descargar en formato MP4.')
      }

      const query = args.join(' ')
      let url, title, thumbBuffer, videoData

      if (!isYTUrl(query)) {
        const search = await yts(query)
        if (!search.all.length) {
          return m.reply('❌ No se encontraron resultados para tu búsqueda.')
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

      const vistas = (videoData.views || 0).toLocaleString()
      const canal = videoData.author?.name || 'YouTube'
      
      let infoMessage = `╔════════════════════╗\n`
      infoMessage += `║   🎬 **YOUTUBE VIDEO** ║\n`
      infoMessage += `╚════════════════════╝\n\n`
      
      infoMessage += `╔▣ **INFORMACIÓN TÉCNICA**\n`
      infoMessage += `┃ ◈ *Título:* ${title}\n`
      infoMessage += `┃ ◈ *Canal:* ${canal}\n`
      infoMessage += `┃ ◈ *Duración:* ${videoData.timestamp || 'N/A'}\n`
      infoMessage += `┃ ◈ *Vistas:* ${vistas}\n`
      infoMessage += `┃ ◈ *Publicado:* ${videoData.ago || 'Reciente'}\n`
      infoMessage += `╚════════════════════\n\n`
      
      infoMessage += `> 🎥 *Descargando video, espere...*`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

      let result
      try {
        const res = await fetch(`${api.url}/download/y2?url=${encodeURIComponent(url)}`)
        result = await res.json()
        
        if (!result.status || !result.result || !result.result.url) {
          return m.reply('❌ Error: No se pudo obtener el enlace de descarga del video.')
        }
      } catch {
        return m.reply('⚠️ El servidor de descarga no responde. Intenta más tarde.')
      }

      const { url: videoUrl, info } = result.result
      const videoTitle = info?.title || title || 'Video'
      const videoBuffer = await getBuffer(videoUrl)
      
      const thumb300 = await sharp(thumbBuffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer();

      await client.sendMessage(m.chat, {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: `${videoTitle}.mp4`,
        jpegThumbnail: thumb300,
        caption: ` ${videoTitle}`
      }, { quoted: m });

    } catch (e) {
      console.error(e)
      await m.reply('❌ Ocurrió un error inesperado al procesar el video.')
    }
  }
};
