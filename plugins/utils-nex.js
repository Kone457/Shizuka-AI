import fetch from "node-fetch"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ""

  if (!mime) {
    return conn.reply(
      m.chat,
      "📦 Por favor, responde a un archivo válido.",
      m
    )
  }

  try {
    const media = await q.download()

    if (!media || !media.length) {
      return m.reply("❌ No se pudo descargar el archivo.")
    }

    const result = await uploadToNexEvo(media, mime)

    if (!result || !result.enlace) {
      console.error("RESPUESTA NEXEVO:", result)
      throw new Error(
        result?.error ||
        result?.message ||
        "La API no devolvió un enlace."
      )
    }

    let txt = `*乂 N E X E V O 乂*\n\n`
    txt += `*» Enlace* : ${result.enlace}\n`
    txt += `*» Nombre* : ${result.nombre || "archivo"}\n`
    txt += `*» Tamaño* : ${formatBytes(result.tamaño || media.length)}\n`
    txt += `*» Tipo* : ${result.tipo || mime}`

    await m.reply(txt)

  } catch (error) {
    console.error(" UPLOAD ERROR:", error)

    await m.reply(
      `❌ Error al subir el archivo.\n\n${error.message || "Error desconocido"}`
    )
  }
}

handler.help = ["nex"]
handler.tags = ["tools"]
handler.command = ["nex"]

export default handler

async function uploadToNexEvo(buffer, originalMime) {

  const detected = await fileTypeFromBuffer(buffer)

  const extension =
    detected?.ext ||
    getExtension(originalMime) ||
    "bin"

  const mime =
    detected?.mime ||
    originalMime ||
    "application/octet-stream"

  const blob = new Blob(
    [buffer],
    {
      type: mime
    }
  )

  const form = new FormData()

  form.append(
    "file",
    blob,
    `archivo.${extension}`
  )

  const baseUrl = String(api.url).replace(/\/+$/, "")

  const url =
    `${baseUrl}/upload?apikey=${encodeURIComponent(api.key)}`

  const response = await fetch(url, {
    method: "POST",
    body: form,
    headers: {
      ...form.headers
    }
  })

  const text = await response.text()

  let data

  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(
      `Respuesta inválida (${response.status}): ${text.slice(0, 500)}`
    )
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      `HTTP ${response.status}`
    )
  }

  return data
}

function formatBytes(bytes) {

  if (!bytes || bytes <= 0) {
    return "0 B"
  }

  const sizes = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ]

  const i = Math.floor(
    Math.log(bytes) / Math.log(1024)
  )

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

function getExtension(mime) {

  const extensions = {

    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/svg+xml": "svg",

    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/3gpp": "3gp",
    "video/quicktime": "mov",
    "video/x-matroska": "mkv",

    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/mp4": "m4a",
    "audio/aac": "aac",
    "audio/flac": "flac",
    "audio/opus": "opus",

    "application/pdf": "pdf",
    "application/zip": "zip",
    "application/x-rar-compressed": "rar",
    "application/x-7z-compressed": "7z",
    "application/gzip": "gz",
    "application/x-tar": "tar",

    "application/vnd.android.package-archive": "apk",
    "application/octet-stream": "bin",

    "text/plain": "txt",
    "text/html": "html",
    "text/css": "css",
    "application/javascript": "js",
    "application/json": "json",

    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",

    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",

    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx"
  }

  return extensions[mime]
}