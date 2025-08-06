import fetch from 'node-fetch'
import cheerio from 'cheerio'

const emoji = '🔞'
const sparkle = '✨'
const flower = '🌸'
const paperclip = '📎'
const error = '❌'
const ai = '🤖'
const kawaii = '💖'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(m.chat, `${error} Shizuka-AI detecta que el contenido NSFW está desactivado aquí...\n${sparkle} Un *administrador* puede activarlo con: *${usedPrefix}nsfw on* ${flower}`, m)
  }

  if (!text) {
    return conn.reply(m.chat, `${emoji} Uhm~ me falta una búsqueda, senpai~\n${paperclip} Por favor, escribe algo como:\n*${usedPrefix + command} colegiala anime*`, m)
  }

  try {
    await conn.reply(m.chat, `${ai} Shizuka-AI está buscando contenido delicado... espera un momentito, por favor ${flower}`, m)

    const res = await xnxxsearch(text)
    const results = res.result
    if (!results.length) return conn.reply(m.chat, `${error} Lo siento mucho, no encontré nada para: *${text}* ${flower}`, m)

    const video = results[0]
    const detail = await xnxxdl(video.link)

    const caption = `
${emoji} *${detail.result.title}* ${sparkle}
⏱️ *Duración:* ${detail.result.duration}
📁 *Info:* ${detail.result.info}
🔗 *Enlace:* ${video.link}
`

    await conn.sendMessage(m.chat, {
      image: { url: detail.result.image },
      caption,
      footer: `${kawaii} Contenido provisto por *Shizuka-AI* con mucho cuidado 💖`,
      contextInfo: {
        externalAdReply: {
          title: 'Video sugerente~',
          body: 'Contenido preparado con elegancia ✨',
          thumbnailUrl: detail.result.image,
          sourceUrl: video.link
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      document: { url: detail.result.files.high },
      mimetype: 'video/mp4',
      fileName: `Shizuka-${detail.result.title.replace(/[^\w\s]/gi, '')}.mp4`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, `${error} ¡Oh no~! Hubo un problema...\n${ai} *Shizuka-AI* te pide disculpas...\n🔧 Detalles: ${e.message}`, m)
  }
}

handler.command = ['xnxxauto', 'xnxx']
handler.help = ['xnxxauto <búsqueda>']
handler.tags = ['nsfw']
handler.register = true
handler.group = false
handler.premium = false

export default handler

// Funciones auxiliares

async function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com'
    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`)
      .then(res => res.text())
      .then(res => {
        const $ = cheerio.load(res)
        const title = []
        const url = []
        const desc = []
        const results = []

        $('div.mozaique div.thumb').each((i, el) => {
          const link = baseurl + $(el).find('a').attr('href')?.replace('/THUMBNUM/', '/') || ''
          url.push(link)
        })

        $('div.mozaique div.thumb-under').each((i, el) => {
          desc.push($(el).find('p.metadata').text())
          $(el).find('a').each((j, e) => {
            title.push($(e).attr('title'))
          })
        })

        for (let i = 0; i < title.length; i++) {
          results.push({ title: title[i], info: desc[i], link: url[i] })
        }

        resolve({ code: 200, status: true, result: results })
      })
      .catch(err => reject({ code: 503, status: false, result: err }))
  })
}

async function xnxxdl(URL) {
  return new Promise((resolve, reject) => {
    fetch(URL)
      .then(res => res.text())
      .then(res => {
        const $ = cheerio.load(res)
        const title = $('meta[property="og:title"]').attr('content')
        const duration = $('meta[property="og:duration"]').attr('content')
        const image = $('meta[property="og:image"]').attr('content')
        const info = $('span.metadata').text()
        const videoScript = $('#video-player-bg > script:nth-child(6)').html() || ''

        const files = {
          low: (videoScript.match(/html5player.setVideoUrlLow\('(.*?)'\);/) || [])[1],
          high: (videoScript.match(/html5player.setVideoUrlHigh\('(.*?)'\);/) || [])[1],
          HLS: (videoScript.match(/html5player.setVideoHLS\('(.*?)'\);/) || [])[1],
        }

        resolve({
          status: 200,
          result: { title, URL, duration, image, info, files }
        })
      })
      .catch(err => reject({ code: 503, status: false, result: err }))
  })
}