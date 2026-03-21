import fetch from "node-fetch"

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

      if (!res.ok) {
        return m.reply("❌ Error: La API mandó todo al carajo (Status " + res.status + ")")
      }

      const buffer = await res.buffer()

      await client.sendMessage(m.chat, {
        image: buffer,
        caption: `🎨 *IMAGEN GENERADA*\n• Prompt: ${text}`
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply("❌ Error al generar la imagen. El servidor probablemente explotó.")
    }
  }
}
