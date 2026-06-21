import fetch from "node-fetch"
import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime) {
    return conn.reply(
      m.chat,
      '📦 Responde a una imagen, video, audio o documento.',
      m
    )
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    })

    const media = await q.download()
    const link = await myCloud(media)

    if (!link.success) {
      throw new Error("Upload fallido")
    }

    const txt = `
*乂 PROJECT CLOUD 乂*

*» Archivo:* ${link.id}
*» Tamaño:* ${formatBytes(media.length)}
*» URL:* ${link.url}
`.trim()

    await conn.reply(m.chat, txt, m)

    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    })

  } catch (e) {
    console.error(e)

    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    })

    conn.reply(
      m.chat,
      '❌ Error al subir el archivo.',
      m
    )
  }
}

handler.help = ['tes']
handler.tags = ['tools']
handler.command = ['tes']

export default handler

function formatBytes(bytes) {
  if (!bytes) return "0 B"

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

async function myCloud(buffer) {
  const type = await fileTypeFromBuffer(buffer)

  const ext = type?.ext || "bin"
  const mime = type?.mime || "application/octet-stream"

  const form = new FormData()

  form.append(
    "file",
    new Blob([buffer], { type: mime }),
    `${crypto.randomBytes(6).toString("hex")}.${ext}`
  )

  const res = await fetch(
    "https://project-x.nfy.fyi/index.php",
    {
      method: "POST",
      body: form
    }
  )

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const json = await res.json()

  return {
    success: json.status,
    id: json.filename,
    url: json.url,
    size: json.size
  }
}