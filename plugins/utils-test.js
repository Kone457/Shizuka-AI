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
      '📦 Responde a un archivo (imagen, video, audio o documento).',
      m
    )
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    })

    const media = await q.download()
    if (!media) throw new Error("No se pudo descargar el archivo")

    const link = await myCloud(media)

    if (!link?.success || !link?.url) {
      throw new Error("Upload fallido")
    }

    const txt = `
*乂 PROJECT CLOUD 乂*

*» Archivo:* ${link.id || "sin-id"}
*» Tamaño:* ${formatBytes(link.size || media.length)}
*» URL:* ${link.url}
`.trim()

    await conn.sendFile(m.chat, media, "file", txt, m)

    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    })

  } catch (e) {
    console.error("UPLOAD ERROR:", e)

    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    })

    await conn.reply(
      m.chat,
      "❌ Error al subir el archivo. Revisa consola.",
      m
    )
  }
}

handler.help = ['tes']
handler.tags = ['tools']
handler.command = ['tes']

export default handler

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return "0 B"
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

async function myCloud(buffer) {
  const type = await fileTypeFromBuffer(buffer)

  const ext = type?.ext || "bin"
  const mime = type?.mime || "application/octet-stream"

  const form = new FormData()

  const filename = `${crypto.randomBytes(6).toString("hex")}.${ext}`

  form.append(
    "file",
    new Blob([buffer], { type: mime }),
    filename
  )

  const res = await fetch("https://project-x.nfy.fyi/index.php", {
    method: "POST",
    body: form
  })

  const text = await res.text()

  console.log("SERVER RESPONSE:", text)

  let json
  try {
    json = JSON.parse(text)
  } catch (e) {
    throw new Error("Respuesta no JSON del servidor")
  }

  return {
    success: json.status,
    id: json.filename,
    url: json.url,
    size: json.size
  }
}