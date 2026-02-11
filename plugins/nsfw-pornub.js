import fetch from "node-fetch"
import * as cheerio from 'cheerio'
import { getBuffer } from '../lib/message.js'

export default {
  command: ["pornhub", "ph"],
  category: "nsfw",
  run: async (client, m, args) => {
    if (global.db.data.chats[m.chat] && !global.db.data.chats[m.chat].nsfw) {
      return m.reply('❌ Los comandos NSFW están desactivados en este Grupo.')
    }

    try {
      const query = args.join(" ")
      if (!query) return m.reply("✨ *Uso correcto:* Ingresa el nombre de un video.")

      await m.reply(`> 🔞 *Procesando búsqueda en Pornhub...*`)

      const searchUrl = `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' }
      })
      const html = await searchRes.text()
      const $ = cheerio.load(html)
      const firstVideo = $('ul#videoSearchResult li.pcVideoListItem').first()
      
      const videoId = firstVideo.attr('data-video-vkey')
      if (!videoId) return m.reply("❌ No se encontraron resultados.")

      const videoUrl = `https://www.pornhub.com/view_video.php?viewkey=${videoId}`
      const title = firstVideo.find('span.title a').text().trim()
      const thumb = firstVideo.find('img').attr('src')
      const duration = firstVideo.find('var.duration').text()


      const apiRes = await fetch(`https://api.vreden.my.id/api/phdl?url=${videoUrl}`)
      const resJson = await apiRes.json()


      const videoDownloadLink = resJson.result?.download
      
      if (!videoDownloadLink) {
        return m.reply("❌ El servidor de descarga está saturado. Intenta de nuevo en unos minutos.")
      }

      let infoMessage = `╔════════════════════╗\n`
      infoMessage += `║   🔞 **PORNHUB DOWNLOAD** ║\n`
      infoMessage += `╚════════════════════╝\n\n`
      infoMessage += `┃ ◈ *Título:* ${title}\n`
      infoMessage += `┃ ◈ *Duración:* ${duration}\n`
      infoMessage += `┃ ◈ *Estado:* ✅ Enviando archivo...\n`
      infoMessage += `╚════════════════════\n`

      await client.sendMessage(m.chat, { 
        image: { url: thumb }, 
        caption: infoMessage 
      }, { quoted: m })

      const videoBuffer = await getBuffer(videoDownloadLink)

      await client.sendMessage(m.chat, {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        jpegThumbnail: await getBuffer(thumb)
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      return m.reply("❌ Error crítico: El video es demasiado pesado o el enlace expiró.")
    }
  }
}
