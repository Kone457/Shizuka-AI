import fetch from 'node-fetch'
import cheerio from 'cheerio'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(
      m.chat,
      `El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *#nsfw on*`,
      m
    )
  }

  if (!text) {
    return conn.reply(
      m.chat,
      `Por favor, ingrese la búsqueda.\n> Ejemplo de uso: ${usedPrefix + command} rubia en el baño`,
      m
    )
  }

  try {
    await conn.reply(
      m.chat,
      `Buscando y procesando los 5 primeros resultados...\n\n> - El tiempo de envío depende del peso y duración de cada video.`,
      m
    )

    const searchRes = await xnxxsearch(text)
    const results = searchRes.result

    if (!results || results.length === 0) {
      throw 'No se encontraron resultados.'
    }

    const firstFive = results.slice(0, 5)

    for (const v of firstFive) {
      const dlRes = await xnxxdl(v.link)
      const files = dlRes.result.files

      if (!files || !files.high) continue

      await conn.sendMessage(
        m.chat,
        {
          video: { url: files.high },
          mimetype: 'video/mp4',
          caption: dlRes.result.title || 'XNXX Video'
        },
        { quoted: m }
      )
    }
  } catch (e) {
    return conn.reply(
      m.chat,
      `${msm} Ocurrió un error.\n\nDetalles: ${e}`,
      m
    )
  }
}

handler.help = ['xnxx <busqueda>']
handler.tags = ['nsfw']
handler.command = ['xnxx']
handler.group = true

export default handler

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