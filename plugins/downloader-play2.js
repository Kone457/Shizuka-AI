import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getBuffer } from '../lib/message.js'

const UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/123 Mobile Safari/537.36"

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

function extractYouTubeId(input) {
  const m = String(input).match(/(?:v=|\/|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function baseHeaders(ref) {
  return {
    "User-Agent": UA,
    Origin: ref,
    Referer: `${ref}/`
  }
}

async function getSanityKey(){

  const ref = "https://frame.y2meta-uk.com"

  const res = await axios.get(
    "https://cnv.cx/v2/sanity/key",
    {headers:baseHeaders(ref)}
  )

  return {key:res.data.key,ref}

}

function toForm(data){

  const p = new URLSearchParams()

  Object.entries(data).forEach(([k,v])=>p.set(k,v))

  return p

}

async function convertVideo(url){

  const videoId = extractYouTubeId(url)

  const {key,ref} = await getSanityKey()

  const payload = {

    link:`https://youtu.be/${videoId}`,
    format:"mp4",
    videoQuality:720,
    vCodec:"h264"

  }

  const res = await axios.post(

    "https://cnv.cx/v2/converter",
    toForm(payload),
    {
      headers:{
        ...baseHeaders(ref),
        "Content-Type":"application/x-www-form-urlencoded",
        key
      }
    }

  )

  return res.data.url

}

async function downloadTmp(url,ext){

  const file = path.join('./tmp',`${Date.now()}.${ext}`)

  const res = await axios({
    url,
    method:"GET",
    responseType:"stream"
  })

  const writer = fs.createWriteStream(file)

  res.data.pipe(writer)

  return new Promise((resolve,reject)=>{

    writer.on('finish',()=>resolve(file))
    writer.on('error',reject)

  })

}

export default {

command:['play2','mp4','ytmp4','ytvideo'],
category:'downloader',

run: async(client,m,args)=>{

try{

if(!args[0]) return m.reply("🌸 Dime el nombre o link del video")

const query = args.join(" ")

let url,video

if(!isYTUrl(query)){

const search = await yts(query)

video = search.all[0]

url = video.url

}else{

const id = extractYouTubeId(query)

video = await yts({videoId:id})

url = query

}

const title = video.title

const thumb = await getBuffer(video.thumbnail)

await client.sendMessage(
m.chat,
{
image:thumb,
caption:`🎬 Preparando video\n\n${title}`
},
{quoted:m}
)

const videoUrl = await convertVideo(url)

const file = await downloadTmp(videoUrl,"mp4")

const thumb300 = await sharp(thumb)
.resize(300,300)
.jpeg({quality:80})
.toBuffer()

await client.sendMessage(
m.chat,
{
video:fs.readFileSync(file),
mimetype:"video/mp4",
fileName:`${title}.mp4`,
jpegThumbnail:thumb300,
caption:`🎬 ${title}`
},
{quoted:m}
)

fs.unlinkSync(file)

}catch(e){

console.error(e)

m.reply("🥀 Error al descargar el video")

}

}

}