import fetch from "node-fetch"
import crypto from "crypto"
import { FormData, Blob, File } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

export default async (buffer) => {
  const type = await fileTypeFromBuffer(buffer)
  const ext = type?.ext || "bin"
  const mime = type?.mime || "application/octet-stream"
  const fileName = `${crypto.randomBytes(5).toString("hex")}.${ext}`

  let res

  try {
    res = await evogb(buffer, fileName, mime)
    if (res?.url) return res.url
  } catch (error) {
    // console.error("Error en EVOGB:", error.message)
  }

  try {
    res = await mini(buffer, fileName, mime)
    if (res?.url) return res.url
  } catch (error) {
    // console.error("Error en MINI:", error.message)
  }

  try {
    res = await uguu(buffer, fileName, mime)
    if (res?.url) return res.url
  } catch (error) {
    // console.error("Error en UGUU:", error.message)
  }

  throw new Error("UPLOAD_FAILED")
}

async function evogb(buffer, fileName, mime) {
  const form = new FormData()
  const blob = new Blob([buffer], { type: mime })

  form.append("file", blob, fileName)

  const res = await fetch("https://evogb.win/api/upload", {
    method: "POST",
    body: form
  })

  if (!res.ok) throw new Error("Status no OK")
  const json = await res.json()

  return { url: json?.url || json?.link }
}


async function mini(buffer, fileName, mime) {
  const form = new FormData()
  const blob = new Blob([buffer], { type: mime })

  form.append("file", blob, fileName)

  const res = await fetch("https://project-sxl.vercel.app/upload", {
    method: "POST",
    body: form
  })

  if (!res.ok) throw new Error("Status no OK")
  const json = await res.json()


  return {
    url: json?.url || json?.data?.url || json?.enlace
  }
}


async function uguu(buffer, fileName, mime) {
  const form = new FormData()

  form.set(
    "files[]",
    new File([buffer], fileName, { type: mime })
  )

  const res = await fetch("https://uguu.se/upload.php", {
    method: "POST",
    body: form
  })

  if (!res.ok) throw new Error("Status no OK")
  const json = await res.json()

  return {
    url: json?.files?.[0]?.url
  }
}
