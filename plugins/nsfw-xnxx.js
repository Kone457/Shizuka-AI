import fetch from "node-fetch"
import * as cheerio from 'cheerio'
import { getBuffer } from '../lib/message.js'
import sharp from 'sharp'

export default {
  command: ["xnxx"],
  category: "nsfw",
  run: async (client, m, args) => {
      
    if (global.db.data.chats[m.chat] && !global.db.data.chats[m.chat].nsfw) {
        return m.reply('❌ Los comandos *NSFW* están desactivados en este Grupo.')
    }

    try {
      const query = args.join(" ")
      if (!query) return m.reply("✨ *Uso correcto:* Ingresa el nombre de un video o una URL de XNXX.")

      let videoInfo

      await m.reply(`> 🔞 *Buscando contenido en el servidor, espere...*`)

      if (query.startsWith("http") && query.includes("xnxx.com")) {
        const res = await xnxxdl(query)
        if (!res.status || !res.result) return m.reply("❌ Error al procesar la URL de XNXX.")
        videoInfo = res.result
      } else {
        const res = await xnxxsearch(query)
        if (!res.status || !res.result || res.result.length === 0) throw new Error("No se encontró el video")

        const randomIndex = Math.floor(Math.random() * res.result.length)
        const selectedVideo = res.result[randomIndex]

        const dlRes = await xnxxdl(selectedVideo.link)
        if (!dlRes.status || !dlRes.result) return m.reply("❌ Error al obtener detalles del video.")
        videoInfo = dlRes.result
      }

      let infoMessage = `╔════════════════════╗\n`
      infoMessage += `║   🔞 **XNXX DOWNLOAD** ║\n`
      infoMessage += `╚════════════════════╝\n\n`
      
      infoMessage += `╔▣ **DETALLES DEL VIDEO**\n`
      infoMessage += `┃ ◈ *Título:* ${videoInfo.title}\n`
      infoMessage += `┃ ◈ *Vistas:* ${videoInfo.info || 'N/A'}\n`
      infoMessage += `┃ ◈ *Calidad:* ${videoInfo.videoWidth ? videoInfo.videoWidth + 'x' + videoInfo.videoHeight : 'N/A'}\n`
      infoMessage += `┃ ◈ *Duración:* ${videoInfo.duration || 'N/A'}\n`
      infoMessage += `┃ ◈ *Estado:* ✅ Extrayendo...\n`
      infoMessage += `╚════════════════════\n\n`
      
      infoMessage += `> ⏳ *Enviando archivo como documento, por favor espere...*`

      await client.sendMessage(m.chat, {
        image: { url: videoInfo.image },
        caption: infoMessage
      }, { quoted: m })

      const videoDownloadLink = videoInfo.files.high || videoInfo.files.low
      if (!videoDownloadLink) return m.reply("❌ No se pudo encontrar un enlace de descarga válido.")

      const thumbBuffer = await getBuffer(videoInfo.image)
      const videoBuffer = await getBuffer(videoDownloadLink)

      const thumbBuffer2 = await sharp(thumbBuffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer()

      let mensaje = {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: `${videoInfo.title}.mp4`,
        jpegThumbnail: thumbBuffer2
      }

      await client.sendMessage(m.chat, mensaje, { quoted: m })

    } catch (err) {
      console.error(err)
      return m.reply("❌ Ocurrió un error inesperado al procesar el contenido.")
    }
  },
}

async function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com'
    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, { method: 'get' })
      .then(res => res.text())
      .then(res => {
        const $ = cheerio.load(res, { xmlMode: false })
        const title = []
        const url = []
        const desc = []
        const results = []

        $('div.mozaique').each(function (a, b) {
          $(b).find('div.thumb').each(function (c, d) {
            const link = $(d).find('a').attr('href')
            if (link) url.push(baseurl + link.replace('/THUMBNUM/', '/'))
          })
        })

        $('div.mozaique').each(function (a, b) {
          $(b).find('div.thumb-under').each(function (c, d) {
            desc.push($(d).find('p.metadata').text())
            $(d).find('a').each(function (e, f) {
              title.push($(f).attr('title'))
            })
          })
        })

        for (let i = 0; i < title.length; i++) {
          results.push({ title: title[i], info: desc[i], link: url[i] })
        }

        resolve({ code: 200, status: true, result: results })
      })
      .catch(err => reject(err))
  })
}

async function xnxxdl(URL) {
  return new Promise((resolve, reject) => {
    fetch(`${URL}`, { method: 'get' })
      .then(res => res.text())
      .then(res => {
        const $ = cheerio.load(res, { xmlMode: false })
        const title = $('meta[property="og:title"]').attr('content')
        const duration = $('meta[property="og:duration"]').attr('content')
        const image = $('meta[property="og:image"]').attr('content')
        const videoType = $('meta[property="og:video:type"]').attr('content')
        const videoWidth = $('meta[property="og:video:width"]').attr('content')
        const videoHeight = $('meta[property="og:video:height"]').attr('content')
        const info = $('span.metadata').text()
        const videoScript = $('#video-player-bg > script:nth-child(6)').html()

        const files = {
          low: (videoScript.match("html5player.setVideoUrlLow\\('(.*?)'\\);") || [])[1],
          high: (videoScript.match("html5player.setVideoUrlHigh\\('(.*?)'\\);") || [])[1],
          HLS: (videoScript.match("html5player.setVideoHLS\\('(.*?)'\\);") || [])[1],
          thumb: (videoScript.match("html5player.setThumbUrl\\('(.*?)'\\);") || [])[1],
          thumb69: (videoScript.match("html5player.setThumbUrl169\\('(.*?)'\\);") || [])[1],
          thumbSlide: (videoScript.match("html5player.setThumbSlide\\('(.*?)'\\);") || [])[1],
          thumbSlideBig: (videoScript.match("html5player.setThumbSlideBig\\('(.*?)'\\);") || [])[1]
        }

        resolve({
          status: 200,
          result: { title, URL, duration, image, videoType, videoWidth, videoHeight, info, files }
        })
      })
      .catch(err => reject(err))
  })
}
