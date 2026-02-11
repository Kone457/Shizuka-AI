import fetch from "node-fetch"
import { getBuffer } from '../lib/message.js'

export default {
  command: ["libro", "book"],
  category: "downloader",
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("✨ *Uso:* .libro [nombre del libro]")

    try {
      await m.reply(`> 📚 *Buscando libro en la biblioteca...*`)

      const res = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(text)}`)
      const json = await res.json()

      if (!json.results || json.results.length === 0) return m.reply("❌ No se encontró el libro.")

      const book = json.results[0]
      const title = book.title
      const author = book.authors.map(a => a.name).join(", ")
      const subjects = book.subjects.slice(0, 2).join(", ")
      const image = book.formats["image/jpeg"]
     
      const downloadUrl = book.formats["application/pdf"] || book.formats["application/epub+zip"] || book.formats["text/plain; charset=utf-8"]

      let details = `📖 *DETALLES DEL LIBRO*\n\n`
      details += `• *Título:* ${title}\n`
      details += `• *Autor:* ${author}\n`
      details += `• *Temas:* ${subjects}\n\n`
      details += `> ⏳ *Enviando archivo, espere...*`

      await client.sendMessage(m.chat, { 
        image: { url: image }, 
        caption: details 
      }, { quoted: m })

      const fileBuffer = await getBuffer(downloadUrl)
      const extension = downloadUrl.includes('.epub') ? 'epub' : 'pdf'

      await client.sendMessage(m.chat, {
        document: fileBuffer,
        mimetype: extension === 'epub' ? 'application/epub+zip' : 'application/pdf',
        fileName: `${title}.${extension}`
      }, { quoted: m })

    } catch (err) {
      m.reply("❌ El libro no tiene una versión de descarga directa compatible.")
    }
  }
}
