import moment from 'moment-timezone'
import pkg from '@whiskeysockets/baileys'
const { prepareWAMessageMedia } = pkg

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

let handler = async (m, { conn, usedPrefix }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })

    const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
    const jam = moment.tz('America/Bogota').format('HH:mm:ss')
    const ucapan = jam < '12:00:00' ? '🌅 Buen día' : jam < '19:00:00' ? '☀️ Buenas tardes' : '🌙 Buenas noches'
    const fecha = moment.tz('America/Bogota').format('DD/MM/YYYY')
    const hora = moment.tz('America/Bogota').format('hh:mm A')

    
    const byTag = {}
    for (const plugin of pluginsActivos) {
      const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
      for (const tag of tags) {
        if (!CATEGORY_META[tag]) continue
        if (!byTag[tag]) byTag[tag] = 0
        byTag[tag]++
      }
    }

    
    const categoryRows = Object.keys(CATEGORY_META)
      .filter(tag => byTag[tag] > 0)
      .map(tag => ({
        header: 'SECCIÓN',
        title: CATEGORY_META[tag],
        description: `Mostrar ${byTag[tag]} comandos de esta categoría`,
        id: `${usedPrefix}menu ${tag}` 
      }))

    
    const media = await prepareWAMessageMedia(
      { image: { url: BANNER_URL } },
      { upload: conn.waUploadToServer }
    )

    let menuTexto = `✦━━━━━━━━━━━━━━━━✦\n`
    menuTexto += `   ${ucapan}, *${m.pushName || 'Usuario'}* ✨\n`
    menuTexto += `   📅 Fecha: ${fecha}\n`
    menuTexto += `   🕒 Hora: ${hora}\n`
    menuTexto += `   👤 Creador: Carlos\n`
    menuTexto += `✦━━━━━━━━━━━━━━━━✦\n\n`
    menuTexto += `Selecciona una categoría en el botón de abajo para ver los comandos disponibles.`

    
    const messageInstance = {
      interactiveMessage: {
        body: { text: menuTexto },
        footer: { text: 'ち卄工乙UＫ丹-丹工 • Dev by Carlos' },
        header: {
          title: '✧ MENU INTERACTIVO ✧',
          hasMediaAttachment: true,
          imageMessage: media.imageMessage
        },
        nativeFlowMessage: {
          buttons: [
            
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '📂 LISTA DE CATEGORÍAS',
                sections: [{
                  title: 'Selecciona una sección',
                  rows: categoryRows
                }]
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
                id: `${usedPrefix}creador`
              })
            },
            
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '📢 Canal Oficial',
                url: 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v',
                merchant_url: 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
              })
            }
          ]
        }
      }
    }

    await conn.relayMessage(m.chat, {
      viewOnceMessage: {
        message: messageInstance
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: `🕸 Error en el Menú: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']

export default handler
