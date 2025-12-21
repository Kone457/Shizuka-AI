import ytdl from 'ytdl-core'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text }) => {
  try {
    if (!text || !ytdl.validateURL(text)) {
      return conn.reply(m.chat, `🌱 Ingresa un link válido de YouTube.`, m)
    }

    let info = await ytdl.getInfo(text)
    let title = info.videoDetails.title.replace(/[^\w\s]/gi, '')
    let filePath = path.join(process.cwd(), `${title}.mp4`)

    // Pedir el mejor formato disponible con video y audio
    let stream = ytdl(text, { quality: 'highest', filter: 'videoandaudio' })
    let writeStream = fs.createWriteStream(filePath)
    stream.pipe(writeStream)

    writeStream.on('finish', async () => {
      let caption = `📂 *Descarga lista*\n\n` +
        `🎬 Título: ${info.videoDetails.title}\n` +
        `⏱️ Duración: ${info.videoDetails.lengthSeconds} segundos\n` +
        `👤 Autor: ${info.videoDetails.author.name}\n`

      await conn.sendMessage(
        m.chat,
        { document: { url: filePath }, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption },
        { quoted: m }
      )

      await conn.sendMessage(m.chat, { react: { text: "☑️", key: m.key } })
      fs.unlinkSync(filePath)
    })
  } catch (error) {
    console.error(error)
    await conn.reply(m.chat, `❌ Error en la descarga:\n> ${error.message}`, m)
  }
}

handler.command = ['ytdl']
handler.help = ['ytdl <url>']
handler.tags = ['downloader']
handler.owner = true

export default handler