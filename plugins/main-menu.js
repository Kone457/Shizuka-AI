import moment from 'moment-timezone'
import pkg from '@whiskeysockets/baileys'
const { prepareWAMessageMedia } = pkg

const BANNER_URL = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Datos/8baf438dfe.jpg'

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
    let headerTitle = '> ✧ 𝙈𝙚𝙣𝙪 𝙋𝙧𝙞𝙣𝙘𝙞𝙥𝙖𝙡 ✧'

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

    await conn.sendMessage(m.chat, { react: { text: '👿', key: m.key } })

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

    const media = await prepareWAMessageMedia({ image: { url: BANNER_URL } }, { upload: conn.waUploadToServer })

    const messageInstance = {
      interactiveMessage: {
        body: { text: menuTexto },
        footer: { text: 'ち卄工乙UＫ丹-丹工 • Dev by Carlos' },
        header: {
          title: headerTitle,
          hasMediaAttachment: true,
          imageMessage: media.imageMessage
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
                id: `${usedPrefix}code`
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
    }

    await conn.relayMessage(m.chat, { viewOnceMessage: { message: messageInstance } }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`> *Error en el menú:* ${e.message}`)
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']

export default handler
