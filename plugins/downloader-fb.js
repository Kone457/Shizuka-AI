
import axios from 'axios'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async (client, m, args, command) => {

    if (!args[0]) {
      return m.reply('✨ *Uso correcto:* Ingrese un enlace de Facebook para descargar el video.')
    }

    if (!args[0].match(/facebook\.com|fb\.watch|video\.fb\.com/)) {
      return m.reply('❌ Por favor, envía un link de Facebook válido.')
    }

    try {
    
      await m.reply('> 📥 *Extrayendo video de Facebook, espere...*')

      const res = await axios.get(`${api.url2}/api/v1/download/facebook`, {
        params: {
          url: args[0]
        }
      })

      const json = res.data

      if (!json.status || !json.result || !json.result.download) {
        return m.reply('❌ No se pudo obtener el video del servidor.')
      }

      const downloads = json.result.download
     
      let videoUrl
      let quality
      
      if (downloads.hd) {
        videoUrl = downloads.hd
        quality = 'HD'
      } else if (downloads.sd) {
        videoUrl = downloads.sd
        quality = 'SD'
      } else {
        return m.reply('❌ No se encontraron enlaces de descarga disponibles.')
      }

      const infoMessage = 'Aquí tienes 😘'

      await client.sendMessage(
        m.chat,
        { 
          video: { url: videoUrl }, 
          caption: infoMessage, 
          mimetype: 'video/mp4', 
          fileName: `fb_video_${quality.toLowerCase()}.mp4`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error('Error en descarga de Facebook:', e)
      await m.reply('❌ Error crítico al descargar de Facebook. Verifique el enlace o intente más tarde.')
    }
  }
}