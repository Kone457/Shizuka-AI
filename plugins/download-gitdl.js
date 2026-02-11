import fetch from "node-fetch"

export default {
  command: ["githubdl", "gitclone"],
  category: "downloader",
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("✨ *Uso:* .githubdl https://aws.amazon.com/es/what-is/repo/")
    
    if (!text.includes('github.com')) return m.reply("❌ Ingresa un enlace válido de GitHub.")

    try {
      await m.reply(`> 📦 *Descargando repositorio...*`)

      const parts = text.replace(/\/$/, "").split('/')
      const repo = parts.pop().replace('.git', '')
      const user = parts.pop()
      
      const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball/main`

      await client.sendMessage(m.chat, {
        document: { url: zipUrl },
        mimetype: 'application/zip',
        fileName: `${repo}.zip`
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      m.reply("❌ Error al descargar el repositorio. Asegúrate de que sea público.")
    }
  }
}
