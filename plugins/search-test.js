import fetch from 'node-fetch'
import crypto from 'crypto'
import { FormData, File, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys'

async function uploadEvoGB(buffer) {
  const type = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' }
  const formData = new FormData()
  const blob = new Blob([buffer], { type: type.mime })
  const fileName = `${crypto.randomBytes(5).toString("hex")}.${type.ext}`

  formData.append("file", blob, fileName)

  const response = await fetch("https://evogb.win/api/upload", {
    method: "POST",
    body: formData
  })

  if (!response.ok) throw new Error()
  const json = await response.json()
  if (!json.success || !json.url) throw new Error()
  
  return json.url
}

async function uploadMiniNube(buffer) {
  const fileType = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' }
  const blob = new Blob([buffer], { type: fileType.mime })
  const formData = new FormData()
  formData.append("file", blob, crypto.randomBytes(5).toString("hex") + "." + fileType.ext)

  const apiUrl = typeof global.api !== 'undefined' ? global.api.url : (typeof api !== 'undefined' ? api.url : 'https://api.ryzendesu.vip/api/uploader')
  const apiKey = typeof global.api !== 'undefined' ? global.api.key : (typeof api !== 'undefined' ? api.key : '')

  const response = await fetch(`${apiUrl}/upload?apikey=${apiKey}`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) throw new Error()
  const json = await response.json()
  if (!json.enlace) throw new Error()

  return json.enlace
}

async function uploadCatbox(buffer) {
  const type = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' }
  const form = new FormData()
  form.set('reqtype', 'fileupload')
  form.set('fileToUpload', new File([buffer], `image.${type.ext}`, { type: type.mime }))
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  const url = (await res.text()).trim()
  if (!url.startsWith('https://')) throw new Error()
  return url
}

async function uploadTmpfiles(buffer) {
  const type = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' }
  const form = new FormData()
  form.set('file', new File([buffer], `image.${type.ext}`, { type: type.mime }))
  const res = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: form })
  const json = await res.json()
  if (!json?.data?.url) throw new Error()
  return json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
}

async function uploadImage(buffer) {
  try {
    return await uploadEvoGB(buffer)
  } catch (e1) {
    try {
      return await uploadMiniNube(buffer)
    } catch (e2) {
      try {
        return await uploadCatbox(buffer)
      } catch (e3) {
        try {
          return await uploadTmpfiles(buffer)
        } catch (e4) {
          throw new Error('Todos los servidores de subida fallaron.')
        }
      }
    }
  }
}

async function searchPinterestByImage(imageUrl, limit = 10) {
  let cookies = ''
  let csrftoken = '1234567890'
  
  try {
    const init = await fetch('https://www.pinterest.com/', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
      }
    })
    const setCookie = init.headers.raw()['set-cookie'] || []
    cookies = setCookie.map(c => c.split(';')[0]).join('; ')
    const csrfMatch = cookies.match(/csrftoken=([^;]+)/)
    if (csrfMatch) csrftoken = csrfMatch[1]
  } catch (e) {}

  const dataObj = {
    options: {
      image_url: imageUrl,
      crop: { x: 0, y: 0, w: 1, h: 1 }
    },
    context: {}
  }

  const url = `https://www.pinterest.com/resource/VisualSearchResource/get/?source_url=${encodeURIComponent('/search/visual_search/?image_url=' + imageUrl)}&data=${encodeURIComponent(JSON.stringify(dataObj))}`

  const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
    'cookie': cookies,
    'referer': 'https://www.pinterest.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'x-app-version': 'c056fb7',
    'x-csrftoken': csrftoken,
    'x-pinterest-appstate': 'active',
    'x-pinterest-pws-handler': 'www/index.js',
    'x-requested-with': 'XMLHttpRequest'
  }

  const res = await fetch(url, { headers })
  const text = await res.text()

  let results = []
  if (text.startsWith('{')) {
    const json = JSON.parse(text)
    results = json?.resource_response?.data?.results || []
  }

  const medias = []
  for (const item of results) {
    let added = false
    if (item?.videos?.video_list) {
      const vlist = item.videos.video_list
      for (const k in vlist) {
        if (vlist[k]?.url && vlist[k].url.endsWith('.mp4')) {
          medias.push({ url: vlist[k].url, type: 'video' })
          added = true
          break
        }
      }
    }
    if (!added) {
      const img = item?.images?.orig?.url || item?.images?.['564x']?.url || item?.images?.['236x']?.url
      if (img) {
        medias.push({ url: img, type: 'image' })
      }
    }
    if (medias.length >= limit) break
  }

  return medias
}

async function searchGoogleLensFallback(imageUrl, limit = 10) {
  const url = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    }
  })
  const html = await res.text()
  const imgMatches = html.match(/https?:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9_\-]+/g) || []
  const uniqueImgs = [...new Set(imgMatches)].map(u => ({ url: u, type: 'image' }))
  return uniqueImgs.slice(0, limit)
}

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime || !mime.startsWith('image/')) {
    return conn.reply(m.chat, '《✧》 Por favor, responde a una imagen para realizar la búsqueda visual.', m)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })

    const media = await q.download()
    const imageUrl = await uploadImage(media)

    let results = []
    try {
      results = await searchPinterestByImage(imageUrl, 10)
    } catch (e) {}

    if (!results || !results.length) {
      results = await searchGoogleLensFallback(imageUrl, 10)
    }

    if (!results || !results.length) {
      throw new Error('No se encontraron imágenes similares.')
    }

    const medias = []
    for (let i = 0; i < results.length; i++) {
      try {
        const r = results[i]
        const res = await fetch(r.url)
        if (!res.ok) continue
        const buf = await res.buffer()
        medias.push({ type: r.type, data: buf })
      } catch (err) {
        continue
      }
    }

    if (!medias.length) throw new Error('Fallo al descargar los resultados.')

    const album = generateWAMessageFromContent(m.chat, {
      albumMessage: { expectedImageCount: medias.length }
    }, {})

    await conn.relayMessage(m.chat, album.message, { messageId: album.key.id })

    for (let i = 0; i < medias.length; i++) {
      const mediaItem = medias[i]
      const msg = await prepareWAMessageMedia(
        mediaItem.type === 'video' ? { video: mediaItem.data } : { image: mediaItem.data },
        { upload: conn.waUploadToServer }
      )
      const content = mediaItem.type === 'video'
        ? { videoMessage: msg.videoMessage, caption: i === 0 ? '✧ Resultados de búsqueda visual' : undefined }
        : { imageMessage: msg.imageMessage, caption: i === 0 ? '✧ Resultados de búsqueda visual' : undefined }

      const message = generateWAMessageFromContent(m.chat, content, {})
      message.message.messageContextInfo = {
        messageAssociation: { associationType: 1, parentMessageKey: album.key }
      }
      await conn.relayMessage(m.chat, message.message, { messageId: message.key.id })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: `《✧》 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['test']
handler.tags = ['buscadores']
handler.command = ['test']
handler.group = true

export default handler
