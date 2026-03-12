import yts from 'yt-search'
import axios from 'axios'
import sharp from 'sharp'
import { getBuffer } from '../lib/message.js'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function getVideo(url){

  for(let i = 0; i < 10; i++){

    try{

      const res = await axios.get(
        `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(url)}`,
        { timeout: 30000 }
      )

      if(res.data?.status && res.data?.result?.download_url){
        return res.data.result.download_url
      }

    }catch(e){
      await sleep(2000)
    }

  }

  throw new Error("API_FAILED")

}

export default {

command:['play2','mp4','ytmp4','ytvideo','playvideo'],
category:'downloader',

run: async (client, m, args) => {

try{

if (!args[0]) {
return m.reply('🌸 *Shizuka AI:*\n> Por favor, indícame qué video deseas visualizar.')
}

const query = args.join(' ')
let url, title, thumbBuffer, videoData

if (!isYTUrl(query)) {

const search = await yts(query)

if (!search.all.length)
return m.reply('🥀 *Lo siento,*\n> no encontré resultados para tu búsqueda.')

videoData = search.all[0]
url = videoData.url

} else {

const videoId = query.split('v=')[1] || query.split('/').pop()

const search = await yts({ videoId })

videoData = search
url = query

}

title = videoData.title

thumbBuffer = await getBuffer(videoData.image || videoData.thumbnail)

const vistas = (videoData.views || 0).toLocaleString()

const canal = videoData.author?.name || 'YouTube'

let infoMessage = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨\n\n`

infoMessage += `🎬 *Tu video se está preparando*\n\n`

infoMessage += `• 🏷️ *Título:* ${title}\n`
infoMessage += `• 🎙️ *Canal:* ${canal}\n`
infoMessage += `• ⏳ *Duración:* ${videoData.timestamp || 'N/A'}\n`
infoMessage += `• 👀 *Vistas:* ${vistas}\n\n`

infoMessage += `> 💎 *Enviando contenido, espera un momento...*`

await client.sendMessage(
m.chat,
{ image: thumbBuffer, caption: infoMessage },
{ quoted: m }
)

const videoUrl = await getVideo(url)

const videoBuffer = await getBuffer(videoUrl)

const thumb300 = await sharp(thumbBuffer)
.resize(300,300)
.jpeg({ quality:80 })
.toBuffer()

await client.sendMessage(
m.chat,
{
video: videoBuffer,
mimetype: 'video/mp4',
fileName: `${title}.mp4`,
jpegThumbnail: thumb300,
caption: `🎬 *${title}*`
},
{ quoted: m }
)

}catch(e){

console.error(e)

await m.reply('🥀 *Shizuka AI:*\n> Ha ocurrido un error inesperado al procesar el video.')

}

}

}