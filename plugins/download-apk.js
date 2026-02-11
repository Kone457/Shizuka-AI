import fetch from "node-fetch"
import { getBuffer } from '../lib/message.js'

export default {
  command: ["apk", "app"],
  category: "downloader",
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("✨ *Uso:* .apk [nombre de la aplicación]")

    try {
      await m.reply(`> 📥 *Buscando aplicación...*`)

      const searchRes = await fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(text)}&limit=1`)
      const searchData = await searchRes.json()

      if (!searchData.datalist || !searchData.datalist.list.length) {
        return m.reply("❌ No se encontró la aplicación.")
      }

      const app = searchData.datalist.list[0]
      const name = app.name
      const packageName = app.package
      const size = (app.file.size / (1024 * 1024)).toFixed(2) 
      const icon = app.icon
      const downloadLink = app.file.path

      let details = `📦 *DETALLES DE APK*\n\n`
      details += `• *Nombre:* ${name}\n`
      details += `• *Paquete:* ${packageName}\n`
      details += `• *Tamaño:* ${size} MB\n\n`
      details += `> ⏳ *Enviando archivo, espere...*`

      await client.sendMessage(m.chat, { 
        image: { url: icon }, 
        caption: details 
      }, { quoted: m })

      const apkBuffer = await getBuffer(downloadLink)

      await client.sendMessage(m.chat, {
        document: apkBuffer,
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${name}.apk`,
        jpegThumbnail: await getBuffer(icon)
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply("❌ Ocurrió un error al procesar la descarga.")
    }
  }
}
