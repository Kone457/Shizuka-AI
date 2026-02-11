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

      const apiUrl = "https://fluximagegen.com/api/generate"

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: text,
          style: "photorealism" 
        })
      })

      const json = await res.json()

      if (!json.success || !json.imageUrl) {
        return m.reply("❌ La API no devolvió una imagen válida.")
      }

      const buffer = await getBuffer(json.imageUrl)

      let caption = `🎨 *IMAGEN GENERADA*\n`
      caption += `• Prompt: ${text}`

      await client.sendMessage(m.chat, {
        image: buffer,
        caption
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply("❌ Error al generar la imagen.")
    }
  }
}