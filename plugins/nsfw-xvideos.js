import fetch from "node-fetch"
import * as cheerio from 'cheerio'
import { getBuffer } from '../lib/message.js'

export default {
  command: ["xvideos", "xv"],
  category: "nsfw",
  run: async (client, m, args) => {
    if (global.db.data.chats[m.chat] && !global.db.data.chats[m.chat].nsfw) {
      return m.reply('❌ Los comandos NSFW están desactivados en este Grupo.')
    }

    try {
      const query = args.join(" ")
      if (!query) return m.reply("✨ *Uso:* .xvideos [título]")

      await m.reply(`> 🔞 *Accediendo a la bóveda de XVideos...*`)
      
      const searchRes = await fetch(`https://www.xvideos.com/?k=${encodeURIComponent(query)}`)
      const html = await searchRes.text()
      const $ = cheerio.load(html)
      
      let videoUrl = ""
      const firstVideo = $('div.mozaique div.thumb a').first().attr('href')
      
      if (!firstVideo) throw "No se encontró el video."
      videoUrl = 'https://www.xvideos.com' + firstVideo

      const videoPage = await fetch(videoUrl)
      const videoHtml = await videoPage.text()
      
      const title = videoHtml.match(/setVideoTitle\('(.*?)'\)/)?.[1] || "Video"
      const thumb = videoHtml.match(/setThumbUrl169\('(.*?)'\)/)?.[1]
      const videoDl = videoHtml.match(/setVideoUrlHigh\('(.*?)'\)/)?.[1]

      let infoMessage = `╔════════════════════╗\n`
      infoMessage += `║   🔞 *XVIDEOS DL* ║\n`
      infoMessage += `╚════════════════════╝\n\n`
      infoMessage += `┃ ◈ *Título:* ${title}\n`
      infoMessage += `┃ ◈ *Estado:* ✅ Enviando MP4...\n`
      infoMessage += `╚════════════════════\n`

      await client.sendMessage(m.chat, { image: { url: thumb }, caption: infoMessage }, { quoted: m })

      const videoBuffer = await getBuffer(videoDl)
      await client.sendMessage(m.chat, {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      }, { quoted: m })

    } catch (e) {
      m.reply("❌ Error al procesar la solicitud de XVideos.")
    }
  }
}
