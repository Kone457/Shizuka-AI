import fetch from "node-fetch"
import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return conn.reply(m.chat, '📦 Por favor, responde a un archivo válido (imagen, video, etc.).', m)

  try {
    let media = await q.download()
    let link = await myCloud(media)

    let txt = `*乂 M I N I - N U B E 乂*\n\n`
    txt += `*» Enlace* : ${link.enlace}\n`
    txt += `*» Nombre* : ${link.nombre}\n`
    txt += `*» Tamaño* : ${formatBytes(link.tamaño)}\n`

    await conn.sendFile(m.chat, media, 'thumbnail.jpg', txt, m)
  } catch (e) {
    console.error(e)
    await m.reply('❌ Error al subir el archivo.')
  }
}

handler.help = ['upp']
handler.tags = ['tools']
handler.command = ['upp']

export default handler

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function myCloud(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {}
  const blob = new Blob([content.toArrayBuffer()], { type: mime })
  const formData = new FormData()
  formData.append("file", blob, crypto.randomBytes(5).toString("hex") + "." + ext)

  const response = await fetch("http://193.70.34.27:20193/upload", {
    method: "POST",
    body: formData
  })

  return await response.json()
}