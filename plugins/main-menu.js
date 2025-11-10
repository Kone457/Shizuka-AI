import fs from 'fs'
import fetch from 'node-fetch'
import moment from 'moment-timezone'

const { default: WA, proto, prepareWAMessageMedia, generateWAMessageFromContent } = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    // --- Datos base ---
    const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
    const sessionFolder = './plugins'
    const subSessions = fs.existsSync(sessionFolder) ? fs.readdirSync(sessionFolder) : []
    const pluginsCount = subSessions.length

    const colombianTime = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })
    const tiempo = new Date(colombianTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '')
    const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

    const jam = moment.tz('America/Bogota').format('HH:mm:ss')
    const ucapan = jam < '11:00:00' ? 'Buen día' : jam < '19:00:00' ? 'Buenas tardes' : 'Buenas noches'

    // --- Configuración local del plugin (IMÁGENES definidas aquí) ---
    const localCategoryConfig = {
      main: { title: '🌟 Comandos Principales', img: 'https://files.catbox.moe/9ya0vv.jpg' },
      rg: { title: '📝 Registro', img: 'https://files.catbox.moe/gneanz.jpg' },
      serbot: { title: '🤖 Sub-Bot', img: 'https://files.catbox.moe/wkj6t1.jpg' },
      info: { title: '📋 Información del Bot', img: 'https://files.catbox.moe/ehvt56.jpg' },
      descargas: { title: '🚀 Descargas', img: 'https://files.catbox.moe/bmd5do.jpg' },
      buscadores: { title: '🔍 Buscadores', img: 'https://files.catbox.moe/vn704y.jpg' },
      ia: { title: '🧠 Inteligencia AI', img: 'https://files.catbox.moe/fwyjwh.jpg' },
      imagen: { title: '🖼️ Generador de Imágenes', img: 'https://files.catbox.moe/d54tip.jpg' },
      fun: { title: '🎉 Diversión y Juegos', img: 'https://files.catbox.moe/33loc9.jpg' },
      game: { title: '🎮 Juegos', img: 'https://files.catbox.moe/33loc9.jpg' },
      anime: { title: '🎌 Anime', img: 'https://files.catbox.moe/ig4t79.jpg' },
      grupo: { title: '👥 Comandos de Grupo', img: 'https://files.catbox.moe/c48cdj.jpg' },
      text: { title: '✒️ Efectos de Texto', img: 'https://files.catbox.moe/ijvbo7.jpg' },
      rpg: { title: '🪄 RPG y Economía', img: 'https://files.catbox.moe/lv6zym.jpg' },
      sticker: { title: '🧧 Stickers', img: 'https://files.catbox.moe/gneanz.jpg' },
      tools: { title: '🔧 Herramientas Útiles', img: 'https://files.catbox.moe/7aawzd.jpg' },
      nsfw: { title: '🔞 Contenido +18', img: 'https://files.catbox.moe/n9ttlo.jpg' },
      owner: { title: '👑 Comandos de Propietario', img: 'https://files.catbox.moe/mr8j0v.jpg' }
    }

    // --- Agrupar comandos por tag ---
    const categoryCommands = {}
    for (const plugin of pluginsActivos) {
      const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
      const helps = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : [])
      for (const tag of tags) {
        if (!localCategoryConfig[tag]) continue
        if (!categoryCommands[tag]) categoryCommands[tag] = new Set()
        for (const h of helps) if (typeof h === 'string' && h.trim()) categoryCommands[tag].add(h.trim())
      }
    }

    // --- Construir tarjetas del carrusel con su propia imagen ---
    const cards = []
    const sortedTags = Object.keys(localCategoryConfig).filter(t => categoryCommands[t]?.size).sort((a, b) => localCategoryConfig[a].title.localeCompare(localCategoryConfig[b].title))

    for (const tag of sortedTags) {
      const cmds = [...categoryCommands[tag]].sort()
      const title = localCategoryConfig[tag].title
      const imgUrl = localCategoryConfig[tag].img
      const descriptionCommands = cmds.map(c => `${usedPrefix}${c}`).slice(0, 12).join('\n') // muestra hasta 12 comandos

      // preparar media (imagen) si está disponible y descargable
      let headerObj
      try {
        const imgBuffer = await (await fetch(imgUrl)).buffer()
        const media = await prepareWAMessageMedia({ image: imgBuffer }, { upload: conn.waUploadToServer })
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: true, imageMessage: media.imageMessage })
      } catch (err) {
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
      }

      const card = {
        header: headerObj,
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: `${title}\n\n${descriptionCommands}` }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `${pluginsCount} plugins • ${tiempo} ${tiempo2}` }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      }

      cards.push(card)
    }

    if (!cards.length) {
      return conn.sendMessage(m.chat, { text: 'No hay comandos disponibles para mostrar.' }, { quoted: m })
    }

    // --- Mensaje interactivo tipo carousel (estructura compatible) ---
    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ text: `${ucapan} ${m.pushName || 'Usuario'}\n\n✧ Menú del Bot\nUsa ${usedPrefix}menu <categoria> para ver los comandos completos.` }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: `Menú • ${pluginsCount} plugins` }),
      header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
      carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
    })

    const messageContent = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: interactive
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: `🕸 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['menu', 'help']
handler.tags = ['info']
handler.command = ['menu', 'help']
export default handler
