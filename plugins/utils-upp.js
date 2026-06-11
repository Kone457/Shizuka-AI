import fetch from "node-fetch"
import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return conn.reply(m.chat, '📦 Por favor, responde a un archivo válido (imagen, video, etc.).', m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let media = await q.download()
    let link = await myCloud(media)

    if (!link.success) throw new Error()

    let txt = `*乂 E V O G B  W I N 乂*\n\n`
    txt += `*» Enlace* : ${link.url}\n`
    txt += `*» ID* : ${link.id}\n`
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`

    await conn.sendFile(m.chat, media, 'file.' + link.url.split('.').pop(), txt, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
  }
}

handler.help = ['upp', 'tourl']
handler.tags = ['tools']
handler.command = ['upp', 'tourl']

export default handler

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function myCloud(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType ? fileType.ext : 'bin'
  const mime = fileType ? fileType.mime : 'application/octet-stream'

  const formData = new FormData()
  const blob = new Blob([content], { type: mime })
  const fileName = `${crypto.randomBytes(5).toString("hex")}.${ext}`
  
  formData.append("file", blob, fileName)

  const response = await fetch("https://evogb.win/api/upload", {
    method: "POST",
    body: formData
  })

  if (!response.ok) throw new Error()

  return await response.json()
}
