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
        return m.reply('🌸 Shizuka AI:\n> Dame el nombre o link de la canción.')
      }

      const query = args.join(' ')
      let url, videoData

      if (!isYTUrl(query)) {
        const search = await yts(query)

        if (!search.videos.length) {
          return m.reply('🥀 No encontré resultados.')
        }

        videoData = search.videos[0]
        url = videoData.url

      } else {

        const videoId = query.split('v=')[1]?.split('&')[0] || query.split('/').pop()
        videoData = await yts({ videoId })
        url = query
      }

      const title = videoData.title
      const thumbUrl = videoData.thumbnail || videoData.image
      const thumbBuffer = await getBuffer(thumbUrl)

      const vistas = (videoData.views || 0).toLocaleString()
      const canal = videoData.author?.name || 'YouTube'

      let info = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒜 𝒜𝐼 ── ✨\n\n`
      info += `🎵 Audio preparado\n\n`
      info += `• 🏷️ Título: ${title}\n`
      info += `• 🎙️ Canal: ${canal}\n`
      info += `• ⏳ Duración: ${videoData.timestamp || 'N/A'}\n`
      info += `• 👀 Vistas: ${vistas}\n\n`
      info += `> ⏳ Descargando audio...`

      await client.sendMessage(m.chat, {
        image: thumbBuffer,
        caption: info
      }, { quoted: m })


      const api = await fetch(`https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`)
      const data = await api.json()

      if (!data.status || !data.result?.mp3) {
        return m.reply('🥀 No se pudo obtener el audio.')
      }

      const mp3Url = data.result.mp3


      const audioFetch = await fetch(mp3Url)
      const audioBuffer = Buffer.from(await audioFetch.arrayBuffer())

      if (audioBuffer.length > 52428800) {
        return m.reply('🥀 El archivo pesa más de 50MB.')
      }


      const thumb300 = await sharp(thumbBuffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer()


      await client.sendMessage(m.chat, {
        document: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${data.result.title || title}.mp3`,
        jpegThumbnail: thumb300
      }, { quoted: m })


    } catch (err) {
      console.error(err)
      m.reply('🥀 Ocurrió un error al descargar la música.')
    }
  }
}