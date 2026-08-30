import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import crypto from 'crypto'
import { FormData, File } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import {
prepareWAMessageMedia,
generateWAMessageFromContent
} from '@whiskeysockets/baileys'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36'

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
throw new Error(json.message || 'No se pudo subir la imagen.')
}

return json.files[0].url
}

async function pinterestDownload(url) {
const headers = {
'user-agent': UA,
'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8',
'accept-language': 'es-419,es;q=0.9,en;q=0.8'
}

const res = await fetch(url, {
headers,
redirect: 'follow'
})

if (!res.ok) {
throw new Error("Pinterest respondió ${res.status}")
}

const html = await res.text()
const $ = cheerio.load(html)

const mp4Matches = [
...html.matchAll(/"(https://[^"]+?.mp4[^"]*)"/gi)
]

for (const match of mp4Matches) {
if (match[1]) {
return {
url: match[1]
.replace(/\/g, '')
.replace(/&/g, '&'),
type: 'video'
}
}
}

const ogVideo =
$('meta[property="og:video:secure_url"]').attr('content') ||
$('meta[property="og:video"]').attr('content')

if (ogVideo) {
return {
url: ogVideo,
type: 'video'
}
}

const ogImage = $('meta[property="og:image"]').attr('content')

if (ogImage) {
return {
url: ogImage,
type: 'image'
}
}

const scriptData =
$('script#PBN_DATA').html() ||
$('script#initial-state').html()

if (scriptData) {
const match = scriptData.match(
/(https://[^"]+?.mp4[^"]*)/i
)

if (match?.[1]) {
  return {
    url: match[1].replace(/\\/g, ''),
    type: 'video'
  }
}

}

throw new Error('No se pudo extraer el contenido.')
}

async function searchPinterest(query, limit = 10) {
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
"https://www.pinterest.com/resource/BaseSearchResource/get/" +
"?source_url=${encodeURIComponent(sourceUrl)}" +
"&data=${encodeURIComponent(JSON.stringify(data))}"

const headers = {
accept: 'application/json, text/javascript, /; q=0.01',
'accept-language': 'es-419,es;q=0.9,en;q=0.8',
referer: 'https://www.pinterest.com/',
'user-agent': UA,
'x-app-version': 'c056fb7',
'x-pinterest-appstate': 'active',
'x-pinterest-pws-handler': 'www/index.js',
'x-requested-with': 'XMLHttpRequest'
}

const res = await fetch(url, { headers })
const text = await res.text()

if (!res.ok) {
throw new Error("Pinterest respondió ${res.status}")
}

if (!text.trim().startsWith('{')) {
throw new Error('Pinterest bloqueó la búsqueda.')
}

const json = JSON.parse(text)

const results =
json?.resource_response?.data?.results || []

const medias = []

for (const item of results) {
let added = false

if (item?.videos?.video_list) {
  const list = item.videos.video_list

  const videos = Object.values(list)
    .filter(v => v?.url)
    .sort((a, b) => {
      const aw = Number(a.width || 0)
      const bw = Number(b.width || 0)
      return bw - aw
    })

  if (videos.length) {
    medias.push({
      url: videos[0].url,
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
      url: image,
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

async function visualSearchPinterest(imageUrl, limit = 10) {
const headers = {
accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8',
'accept-language': 'es-419,es;q=0.9,en;q=0.8',
referer: 'https://www.pinterest.com/',
'user-agent': UA
}

const lensUrl =
"https://www.pinterest.com/search/pins/?q=visual_search&image_url=${encodeURIComponent(imageUrl)}"

const res = await fetch(lensUrl, {
headers,
redirect: 'follow'
})

if (!res.ok) {
throw new Error("Pinterest Lens respondió ${res.status}")
}

const html = await res.text()
const $ = cheerio.load(html)

const candidates = []

$('meta[property="og:image"]').each((_, el) => {
const url = $(el).attr('content')

if (url && !candidates.includes(url)) {
  candidates.push(url)
}

})

const jsonMatches = [
...html.matchAll(
/https?:\?/\?/[^"'\s]+?.(?:jpg|jpeg|png|webp)(?:?[^"'\s]*)?/gi
)
]

for (const match of jsonMatches) {
const url = match[0]
.replace(/\//g, '/')
.replace(/\/g, '')

if (
  url &&
  !url.includes('avatar') &&
  !url.includes('profile') &&
  !candidates.includes(url)
) {
  candidates.push(url)
}

if (candidates.length >= limit) break

}

if (candidates.length) {
return candidates
.slice(0, limit)
.map(url => ({
url,
type: 'image'
}))
}

const query =
$('meta[property="og:title"]').attr('content') ||
$('title').text() ||
''

const cleanQuery = query
.replace(/Pinterest/gi, '')
.replace(/Visual Search/gi, '')
.trim()

if (cleanQuery) {
return await searchPinterest(cleanQuery, limit)
}

throw new Error(
'Pinterest no devolvió resultados visuales.'
)
}

async function downloadMedia(url) {
const res = await fetch(url, {
headers: {
'user-agent': UA,
referer: 'https://www.pinterest.com/'
}
})

if (!res.ok) {
throw new Error("No se pudo descargar el resultado (${res.status})")
}

return Buffer.from(await res.arrayBuffer())
}

async function sendAlbum(conn, m, medias, title) {
const downloaded = []

for (const item of medias) {
try {
const buffer = await downloadMedia(item.url)

  if (!buffer?.length) continue

  downloaded.push({
    type: item.type,
    data: buffer
  })
} catch {}

}

if (!downloaded.length) {
throw new Error('No se pudieron descargar los resultados.')
}

const album = generateWAMessageFromContent(
m.chat,
{
albumMessage: {
expectedImageCount: downloaded.length
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

for (let i = 0; i < downloaded.length; i++) {
const media = downloaded[i]

const msg = await prepareWAMessageMedia(
  media.type === 'video'
    ? { video: media.data }
    : { image: media.data },
  {
    upload: conn.waUploadToServer
  }
)

const content =
  media.type === 'video'
    ? {
        videoMessage: {
          ...msg.videoMessage,
          caption:
            i === 0
              ? title
              : undefined
        }
      }
    : {
        imageMessage: {
          ...msg.imageMessage,
          caption:
            i === 0
              ? title
              : undefined
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

let handler = async (m, { conn, args, text }) => {
const input =
args.length
? args.join(' ').trim()
: text?.trim()

try {
await conn.sendMessage(m.chat, {
react: {
text: '⌛',
key: m.key
}
})

let results
let mode = 'text'

const quoted = m.quoted || m
const mime =
  (quoted.msg || quoted).mimetype || ''

const isImage =
  /^image\/(jpe?g|png|webp)$/i.test(mime)

if (isImage) {
  mode = 'image'

  const buffer = await quoted.download()

  if (!buffer?.length) {
    throw new Error(
      'No se pudo descargar la imagen.'
    )
  }

  const imageUrl = await uploadUguu(buffer)

  results = await visualSearchPinterest(
    imageUrl,
    10
  )

  if (!results?.length) {
    throw new Error(
      'Pinterest no encontró imágenes similares.'
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
      await pinterestDownload(input)

    if (!result?.url) {
      throw new Error(
        'No se pudo obtener el contenido del Pin.'
      )
    }

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
    results = await searchPinterest(
      input,
      10
    )

    if (!results?.length) {
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

await conn.sendMessage(m.chat, {
  react: {
    text: '✅',
    key: m.key
  }
})

} catch (e) {
console.error(e)

await conn.sendMessage(m.chat, {
  react: {
    text: '❌',
    key: m.key
  }
})

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