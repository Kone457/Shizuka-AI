import fetch from "node-fetch"
import { getBuffer } from '../lib/message.js'

export default {
  command: ["tik"],
  category: "downloader",
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("✨ *Uso:* .tiktok [url de tiktok]")

    try {
      await m.reply(`> 📥 *Procesando video de TikTok...*`)

      const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${text}`)
      const json = await res.json()

      if (!json.video || !json.video.noWatermark) throw "No se pudo obtener el video."

      const videoBuffer = await getBuffer(json.video.noWatermark)
      
      await client.sendMessage(m.chat, {
        video: videoBuffer,
        caption: "Aquí tienes 😘",
        mimetype: 'video/mp4'
      }, { quoted: m })

    } catch (e) {
      m.reply("❌ Error: Asegúrate de que sea un enlace válido de TikTok.")
    }
  }
}