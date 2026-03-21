
import fetch from "node-fetch"
import { getBuffer } from "../lib/message.js"

export default {
  command: ["dalle", "crearimagen", "genimg"],
  category: "ai",
  run: async (client, m, args) => {

    const text = args.join(" ")
    if (!text) return m.reply("✨ *Uso:* .dalle descripción de la imagen")

    try {
      await m.reply("> 🖼️ Generando imagen...")

      const apiUrl = `${api.url}/ai/flux?prompt=${encodeURIComponent(text)}`

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json.success || !json.result) {
        return m.reply("❌ La API no devolvió una imagen válida.")
      }

      const buffer = await getBuffer(json.result) 

      await client.sendMessage(m.chat, {
        image: buffer,
        caption: `🎨 *IMAGEN GENERADA*\n• Prompt: ${text}`
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply("❌ Error al generar la imagen.")
    }
  }
}