
import fetch from "node-fetch"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""

  if (!mime) {
    return conn.reply(
      m.chat,
      "📦 Por favor, responde a un archivo válido.",
      m
    )
  }

  try {
    let media = await q.download()

    if (!media) {
      return m.reply("❌ No se pudo descargar el archivo.")
    }

    let result = await uploadFile(media, mime)

    if (!result || result.status !== true || !result.enlace) {
      console.error("NexEvo Upload:", result)
      throw new Error(result?.error || "La API no devolvió un enlace.")
    }

    let txt = `*乂 N E X E V O 乂*\n\n`
    txt += `*» Enlace* : ${result.enlace}\n`
    txt += `*» Nombre* : ${result.nombre}\n`
    txt += `*» Tamaño* : ${formatBytes(result.tamaño)}\n`
    txt += `*» Tipo* : ${result.tipo || mime}`

    await m.reply(txt)

  } catch (e) {
    console.error("UPLOAD ERROR:", e)
    await m.reply(`❌ Error al subir el archivo.\n\n${e.message || e}`)
  }
}

handler.help = ["nex"]
handler.tags = ["tools"]
handler.command = ["nex"]

export default handler

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B"

  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function uploadFile(buffer, originalMime) {

  const detected = await fileTypeFromBuffer(buffer)

  const ext =
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

  const formData = new FormData()

  formData.append(
    "file",
    blob,
    `archivo.${ext}`
  )

  const url =
    `${api.url.replace(/\/+$/, "")}/upload?apikey=${encodeURIComponent(api.key)}`

  console.log("NexEvo Upload URL:", url.replace(api.key, "********"))

  const response = await fetch(url, {
    method: "POST",
    body: formData
  })

  const text = await response.text()

  let data

  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(
      `Respuesta inválida de la API (${response.status}): ${text.slice(0, 300)}`
    )
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      `API respondió con ${response.status}`
    )
  }

  return data
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