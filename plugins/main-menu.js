import moment from 'moment-timezone'

const BANNER_URL = 'https://ik.imagekit.io/ybi6xmp5g/Bot.jpg'

const CATEGORY_META = {
  main: '🌟 Comandos Principales',
  rg: '📝 Registro',
  info: '📋 Información del Bot',
  ia: '🧠 Inteligencia AI',
  buscadores: '🔍 Buscadores',
  descargas: '🚀 Descargas',
  imagen: '🖼️ Generador de Imágenes',
  fun: '🎉 Diversión y Juegos',
  game: '🎮 Juegos',
  anime: '🎌 Anime',
  grupo: '👥 Comandos de Grupo',
  tools: '🔧 Herramientas Útiles',
  owner: '👑 Comandos de Owner'
}

let handler = async (m, { conn, usedPrefix, text }) => {
  try {
    const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
    const jam = moment.tz('America/Bogota').format('HH:mm:ss')
    const ucapan = jam < '12:00:00' ? '🌅 Buen día' : jam < '19:00:00' ? '☀️ Buenas tardes' : '🌙 Buenas noches'
    const fecha = moment.tz('America/Bogota').format('DD/MM/YYYY')
    const hora = moment.tz('America/Bogota').format('hh:mm A')

    let menuTexto = ''
    let headerTitle = '✧ ち卄工乙UＫ丹-丹工 ✧'

    if (text) {
      const tag = text.toLowerCase().trim()
      if (CATEGORY_META[tag]) {
        headerTitle = `✧ SECCIÓN: ${tag.toUpperCase()} ✧`
        const helps = pluginsActivos
          .filter(p => p.tags && p.tags.includes(tag))
          .flatMap(p => Array.isArray(p.help) ? p.help : [p.help])
          .sort()

        menuTexto = `╭─❖ *${CATEGORY_META[tag]}* ❖─╮\n`
        menuTexto += helps.map(h => `│ • ${usedPrefix}${h}`).join('\n')
        menuTexto += `\n╰───────────────╯`
      }
    } 

    if (!menuTexto) {
      menuTexto = `✦━━━━━━━━━━━━━━━━✦\n`
      menuTexto += `   ${ucapan}, *${m.pushName || 'Carlos'}* ✨\n`
      menuTexto += `   📅 Fecha: ${fecha}\n`
      menuTexto += `   🕒 Hora: ${hora}\n`
      menuTexto += `   👤 Creador: Carlos\n`
      menuTexto += `✦━━━━━━━━━━━━━━━━✦\n\n`
      menuTexto += `Presiona el botón de abajo para desplegar las categorías y ver los comandos.`
    }

    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })

    const byTag = {}
    for (const plugin of pluginsActivos) {
      const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
      for (const tag of tags) {
        if (!CATEGORY_META[tag]) continue
        byTag[tag] = (byTag[tag] || 0) + 1
      }
    }

    const categoryRows = Object.keys(CATEGORY_META)
      .filter(tag => byTag[tag] > 0)
      .map(tag => ({
        header: 'SECCIÓN',
        title: CATEGORY_META[tag],
        description: `Ver ${byTag[tag]} comandos`,
        id: `${usedPrefix}menu ${tag}`
      }))

    const messageInstance = {
      body: { text: menuTexto },
      footer: { text: 'ち卄工乙UＫ丹-丹工 • Dev by Carlos' },
      header: {
        title: headerTitle,
        hasMediaAttachment: false
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '📂 SELECCIONAR CATEGORÍA',
              sections: [{ title: 'Categorías Disponibles', rows: categoryRows }]
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '💻 Ser Subbot',
              id: `${usedPrefix}serbot`
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '👑 Creador',
              id: `${usedPrefix}owner`
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '📢 Canal Oficial',
              url: 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
            })
          }
        ]
      }
    }

    await conn.relayMessage(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            ...messageInstance,
            contextInfo: {
              externalAdReply: {
                title: '✧ ち卄工乙UＫ丹-丹工 ✧',
                body: '𝓢𝓾𝓹𝓮𝓻 𝓑𝓸𝓽 𝓭𝓮 𝓦𝓱𝓪𝓽𝓼𝓐𝓹𝓹',
                thumbnailUrl: BANNER_URL,
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
              }
            }
          }
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`> *Error en el menú:* ${e.message}`)
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']

export default handler
