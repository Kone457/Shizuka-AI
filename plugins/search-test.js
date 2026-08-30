import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import crypto from 'crypto'
import { FormData, File } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import {
prepareWAMessageMedia,
generateWAMessageFromContent
} from '@whiskeysockets/baileys'

const UA =
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36'

async function uploadUguu(buffer) {
const type = await fileTypeFromBuffer(buffer)

if (!type) {
throw new Error('No se pudo detectar el tipo de imagen.')
}

const form = new FormData()

form.set(
'files[]',
new File(
[buffer],
"${crypto.randomBytes(6).toString('hex')}.${type.ext}",
{
type: type.mime
}
)
)

const res = await fetch('https://uguu.se/upload.php', {
method: 'POST',
body: form,
headers: form.headers
})

const json = await res.json()

if (!res.ok || !json.success || !json.files?.length) {
throw new Error(json.message || 'No se pudo subir la imagen.')
}

return json.files[0].url
}

function cleanUrl(url) {
if (!url) return null

return String(url)
.replaceAll('\/', '/')
.replaceAll('\u002F', '/')
.replaceAll('\u003A', ':')
.replaceAll('&', '&')
.replaceAll('\"', '"')
.replace(/^"+|"+$/g, '')
.trim()
}

function findMp4(html) {
const text = String(html)
.replaceAll('\/', '/')
.replaceAll('\u002F', '/')
.replaceAll('&', '&')

const markers = [
'.mp4',
'.mp4?',
'.mp4&'
]

for (const marker of markers) {
let position = text.indexOf(marker)

while (position !== -1) {
  const start = text.lastIndexOf('https://', position)

  if (start !== -1) {
    const end = position + 4
    const url = cleanUrl(
      text.slice(start, end)
    )

    if (
      url &&
      url.startsWith('https://') &&
      url.toLowerCase().includes('.mp4')
    ) {
      return url
    }
  }

  position = text.indexOf(
    marker,
    position + marker.length
  )
}

}

return null
}

async function pinterestDownload(url) {
const headers = {
'user-agent': UA,
accept:
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8',
'accept-language':
'es-419,es;q=0.9,en;q=0.8'
}

const res = await fetch(url, {
headers,
redirect: 'follow'
})

if (!res.ok) {
throw new Error(
"Pinterest respondió ${res.status}"
)
}

const html = await res.text()
const $ = cheerio.load(html)

const mp4 = findMp4(html)

if (mp4) {
return {
url: mp4,
type: 'video'
}
}

const ogVideo =
$('meta[property="og:video:secure_url"]').attr(
'content'
) ||
$('meta[property="og:video"]').attr(
'content'
)

if (ogVideo) {
return {
url: cleanUrl(ogVideo),
type: 'video'
}
}

const ogImage =
$('meta[property="og:image"]').attr(
'content'
)

if (ogImage) {
return {
url: cleanUrl(ogImage),
type: 'image'
}
}

const scriptData =
$('script#PBN_DATA').html() ||
$('script#initial-state').html()

if (scriptData) {
const scriptMp4 = findMp4(scriptData)

if (scriptMp4) {
  return {
    url: scriptMp4,
    type: 'video'
  }
}

}

throw new Error(
'No se pudo extraer el contenido del Pin.'
)
}

async function searchPinterest(
query,
limit = 10
) {
query = String(query).trim()

const encoded = encodeURIComponent(query)

const sourceUrl =
"/search/pins/?q=${encoded}&rs=typed"

const data = {
options: {
query,
scope: 'pins',
rs: 'typed',
redux_normalize_feed: true,
source_url: sourceUrl
},
context: {}
}

const url =
'https://www.pinterest.com/resource/BaseSearchResource/get/' +
"?source_url=${encodeURIComponent(sourceUrl)}" +
"&data=${encodeURIComponent( JSON.stringify(data) )}"

const headers = {
accept:
'application/json, text/javascript, /; q=0.01',
'accept-language':
'es-419,es;q=0.9,en;q=0.8',
referer:
'https://www.pinterest.com/',
'user-agent': UA,
'x-app-version': 'c056fb7',
'x-pinterest-appstate': 'active',
'x-pinterest-pws-handler':
'www/index.js',
'x-requested-with':
'XMLHttpRequest'
}

const res = await fetch(url, {
headers
})

const text = await res.text()

if (!res.ok) {
throw new Error(
"Pinterest respondió ${res.status}"
)
}

if (!text.trim().startsWith('{')) {
throw new Error(
'Pinterest bloqueó la búsqueda.'
)
}

const json = JSON.parse(text)

const results =
json?.resource_response?.data?.results || []

const medias = []

for (const item of results) {
let added = false

if (item?.videos?.video_list) {
  const videos = Object.values(
    item.videos.video_list
  )
    .filter(video => video?.url)
    .sort(
      (a, b) =>
        Number(b.width || 0) -
        Number(a.width || 0)
    )

  if (videos.length) {
    medias.push({
      url: cleanUrl(videos[0].url),
      type: 'video'
    })

    added = true
  }
}

if (!added) {
  const image =
    item?.images?.orig?.url ||
    item?.images?.['736x']?.url ||
    item?.images?.['564x']?.url ||
    item?.images?.['474x']?.url ||
    item?.images?.['236x']?.url

  if (image) {
    medias.push({
      url: cleanUrl(image),
      type: 'image'
    })
  }
}

if (medias.length >= limit) {
  break
}

}

return medias
}

function extractImageUrls(html, limit) {
const normalized = String(html)
.replaceAll('\/', '/')
.replaceAll('\u002F', '/')
.replaceAll('&', '&')

const urls = []
const extensions = [
'.jpg',
'.jpeg',
'.png',
'.webp'
]

let position = 0

while (
position < normalized.length &&
urls.length < limit
) {
const start = normalized.indexOf(
'https://',
position
)

if (start === -1) break

let end = normalized.indexOf(
  '"',
  start
)

const singleEnd = normalized.indexOf(
  "'",
  start
)

if (
  singleEnd !== -1 &&
  (end === -1 || singleEnd < end)
) {
  end = singleEnd
}

if (end === -1) {
  end = normalized.length
}

const candidate = cleanUrl(
  normalized.slice(start, end)
)

const lower = candidate.toLowerCase()

if (
  extensions.some(ext =>
    lower.includes(ext)
  ) &&
  !lower.includes('avatar') &&
  !lower.includes('profile')
) {
  if (!urls.includes(candidate)) {
    urls.push(candidate)
  }
}

position =
  start + 'https://'.length

}

return urls
}

async function visualSearchPinterest(
imageUrl,
limit = 10
) {
const headers = {
accept:
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8',
'accept-language':
'es-419,es;q=0.9,en;q=0.8',
referer:
'https://www.pinterest.com/',
'user-agent': UA
}

const urls = [
"https://www.pinterest.com/search/pins/?q=visual_search&image_url=${encodeURIComponent(imageUrl)}",
"https://www.pinterest.com/search/visual-search/?image_url=${encodeURIComponent(imageUrl)}"
]

for (const url of urls) {
try {
const res = await fetch(url, {
headers,
redirect: 'follow'
})

  if (!res.ok) continue

  const html = await res.text()
  const $ = cheerio.load(html)

  const found = []

  $('meta[property="og:image"]').each(
    (_, element) => {
      const image = cleanUrl(
        $(element).attr('content')
      )

      if (
        image &&
        !found.includes(image)
      ) {
        found.push(image)
      }
    }
  )

  const extracted =
    extractImageUrls(
      html,
      limit
    )

  for (const image of extracted) {
    if (!found.includes(image)) {
      found.push(image)
    }

    if (found.length >= limit) {
      break
    }
  }

  if (found.length) {
    return found
      .slice(0, limit)
      .map(image => ({
        url: image,
        type: 'image'
      }))
  }
} catch {}

}

throw new Error(
'Pinterest no devolvió resultados de búsqueda visual.'
)
}

async function downloadMedia(url) {
const res = await fetch(url, {
headers: {
'user-agent': UA,
referer:
'https://www.pinterest.com/'
}
})

if (!res.ok) {
throw new Error(
"No se pudo descargar el resultado (${res.status})"
)
}

return Buffer.from(
await res.arrayBuffer()
)
}

async function sendAlbum(
conn,
m,
medias,
title
) {
const downloaded = []

for (const item of medias) {
try {
if (!item?.url) continue

  const buffer =
    await downloadMedia(item.url)

  if (!buffer?.length) continue

  downloaded.push({
    type: item.type,
    data: buffer
  })
} catch {}

}

if (!downloaded.length) {
throw new Error(
'No se pudieron descargar los resultados.'
)
}

const album =
generateWAMessageFromContent(
m.chat,
{
albumMessage: {
expectedImageCount:
downloaded.length
}
},
{}
)

await conn.relayMessage(
m.chat,
album.message,
{
messageId: album.key.id
}
)

for (
let i = 0;
i < downloaded.length;
i++
) {
const media = downloaded[i]

const msg =
  await prepareWAMessageMedia(
    media.type === 'video'
      ? { video: media.data }
      : { image: media.data },
    {
      upload:
        conn.waUploadToServer
    }
  )

const caption =
  i === 0
    ? title
    : undefined

const content =
  media.type === 'video'
    ? {
        videoMessage: {
          ...msg.videoMessage,
          caption
        }
      }
    : {
        imageMessage: {
          ...msg.imageMessage,
          caption
        }
      }

const message =
  generateWAMessageFromContent(
    m.chat,
    content,
    {}
  )

message.message.messageContextInfo = {
  messageAssociation: {
    associationType: 1,
    parentMessageKey: album.key
  }
}

await conn.relayMessage(
  m.chat,
  message.message,
  {
    messageId: message.key.id
  }
)

}
}

let handler = async (
m,
{ conn, args, text }
) => {
const input =
args.length
? args.join(' ').trim()
: text?.trim()

try {
await conn.sendMessage(
m.chat,
{
react: {
text: '⌛',
key: m.key
}
}
)

const quoted =
  m.quoted || m

const mime =
  (quoted.msg || quoted).mimetype || ''

const isImage =
  /^image\/(jpe?g|png|webp)$/i.test(
    mime
  )

if (isImage) {
  const buffer =
    await quoted.download()

  if (!buffer?.length) {
    throw new Error(
      'No se pudo descargar la imagen.'
    )
  }

  await conn.sendMessage(
    m.chat,
    {
      text:
        '⌕ Buscando imágenes similares...'
    },
    {
      quoted: m
    }
  )

  const imageUrl =
    await uploadUguu(buffer)

  const results =
    await visualSearchPinterest(
      imageUrl,
      10
    )

  if (!results.length) {
    throw new Error(
      'No se encontraron imágenes similares.'
    )
  }

  await sendAlbum(
    conn,
    m,
    results,
    '✧ Resultados de búsqueda visual de Pinterest'
  )
} else {
  if (!input) {
    throw new Error(
      'Responde a una imagen o escribe algo para buscar en Pinterest.'
    )
  }

  if (
    /^https?:\/\/(www\.)?(pin\.it|pinterest\.[a-z.]+)/i.test(
      input
    )
  ) {
    const result =
      await pinterestDownload(
        input
      )

    await conn.sendFile(
      m.chat,
      result.url,
      result.type === 'video'
        ? 'pinterest.mp4'
        : 'pinterest.jpg',
      '',
      m
    )
  } else {
    const results =
      await searchPinterest(
        input,
        10
      )

    if (!results.length) {
      throw new Error(
        'No se encontraron resultados para tu búsqueda.'
      )
    }

    await sendAlbum(
      conn,
      m,
      results,
      `✧ Álbum de Pinterest para *${input}*`
    )
  }
}

await conn.sendMessage(
  m.chat,
  {
    react: {
      text: '✅',
      key: m.key
    }
  }
)

} catch (e) {
console.error(e)

await conn.sendMessage(
  m.chat,
  {
    react: {
      text: '❌',
      key: m.key
    }
  }
)

await conn.sendMessage(
  m.chat,
  {
    text: `✿ Error [${e.message || e}]`
  },
  {
    quoted: m
  }
)

}
}

handler.help = ['test']
handler.tags = ['buscadores']
handler.command = ['test']
handler.group = true

export default handler