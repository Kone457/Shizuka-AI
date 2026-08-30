import fetch from 'node-fetch'
import crypto from 'crypto'
import { FormData, File } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys'

async function uploadUguu(buffer) {
  const type = await fileTypeFromBuffer(buffer)
  if (!type) throw new Error('No se pudo detectar el tipo de archivo.')

  const form = new FormData()
  form.set(
    'files[]',
    new File(
      [buffer],
      `${crypto.randomBytes(6).toString('hex')}.${type.ext}`,
      { type: type.mime }
    )
  )

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body: form,
    headers: form.headers
  })

  const json = await res.json()
  if (!res.ok || !json.success || !json.files?.length) {
    throw new Error(json.message || 'Error al subir el archivo.')
  }

  return json.files[0].url
}

async function searchPinterestByImage(imageUrl, limit = 10) {
  const url = `https://id.pinterest.com/resource/VisualSearchResource/get/?source_url=%2Fsearch%2Fvisual_search%2F%3Fimage_url%3D${encodeURIComponent(imageUrl)}&data=%7B%22options%22%3A%7B%22image_url%22%3A%22${encodeURIComponent(imageUrl)}%22%2C%22tag%22%3A%22%22%2C%22crop%22%3A%7B%22x%22%3A0%2C%22y%22%3A0%2C%22w%22%3A1%2C%22h%22%3A1%7D%7D%2C%22context%22%3A%7B%7D%7D`

  const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'es-419,es;q=0.9,en;q=0.8',
    'referer': 'https://id.pinterest.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36',
    'x-app-version': 'c056fb7',
    'x-pinterest-appstate': 'active',
    'x-pinterest-pws-handler': 'www/index.js',
    'x-pinterest-source-url': '/',
    'x-requested-with': 'XMLHttpRequest'
  }

  const res = await fetch(url, { headers })
  const text = await res.text()

  if (!text.startsWith('{')) throw new Error('Pinterest bloqueó la petición de búsqueda visual')

  const json = JSON.parse(text)
  const results = json?.resource_response?.data?.results || []
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

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime || !mime.startsWith('image/')) {
    return conn.reply(m.chat, '《✧》 Por favor, responde a una imagen para buscar resultados similares en Pinterest.', m)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })

    const media = await q.download()
    const imageUrl = await uploadUguu(media)
    const results = await searchPinterestByImage(imageUrl, 10)

    if (!results || !results.length) throw new Error('No se encontraron resultados visuales similares.')

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

    if (!medias.length) throw new Error('Fallo al descargar los archivos de la búsqueda visual.')

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
        ? { videoMessage: msg.videoMessage, caption: i === 0 ? '✧ Álbum de búsqueda visual de Pinterest' : undefined }
        : { imageMessage: msg.imageMessage, caption: i === 0 ? '✧ Álbum de búsqueda visual de Pinterest' : undefined }

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

handler.help = ['lents']
handler.tags = ['buscadores']
handler.command = ['lents', 'test']
handler.group = true

export default handler
