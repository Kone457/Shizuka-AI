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

let handler = async (m, { conn, usedPrefix, text }) => {
  try {
    const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)

    // --- LÓGICA PARA LOS DESLIZABLES (CATEGORÍAS) ---
    // Si 'text' existe, significa que el usuario eligió una categoría en el botón deslizable
    if (text) {
      const tag = text.toLowerCase().trim()
      if (CATEGORY_META[tag]) {
        // Filtramos los comandos que pertenecen a esta etiqueta
        const helps = []
        for (const plugin of pluginsActivos) {
          const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
          if (tags.includes(tag)) {
            const h = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
            helps.push(...h)
          }
        }

        if (helps.length > 0) {
          let txt = `╭─❖ ${CATEGORY_META[tag]} ❖─╮\n`
          txt += helps.sort().map(h => `│ • ${usedPrefix}${h}`).join('\n')
          txt += `\n╰───────────────╯`
          
          // Enviamos la lista de comandos de esa categoría y cortamos la ejecución aquí
          return await m.reply(txt)
        }
      }
    }

    // --- SI NO HAY TEXTO, ENVIAMOS EL MENÚ DE BOTONES PRINCIPAL ---
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })

    const jam = moment.tz('America/Bogota').format('HH:mm:ss')
    const ucapan = jam < '12:00:00' ? '🌅 Buen día' : jam < '19:00:00' ? '☀️ Buenas tardes' : '🌙 Buenas noches'
    const fecha = moment.tz('America/Bogota').format('DD/MM/YYYY')
    const hora = moment.tz('America/Bogota').format('hh:mm A')

    // Contar comandos por tag para la lista
    const byTag = {}
    for (const plugin of pluginsActivos) {
      const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
      for (const tag of tags) {
        if (!CATEGORY_META[tag]) continue
        byTag[tag] = (byTag[tag] || 0) + 1
      }
    }

    // Filas para el Single Select
    const categoryRows = Object.keys(CATEGORY_META)
      .filter(tag => byTag[tag] > 0)
      .map(tag => ({
        header: 'SECCIÓN',
        title: CATEGORY_META[tag],
        description: `Ver ${byTag[tag]} comandos`,
        id: `${usedPrefix}menu ${tag}` // Importante: esto envía ".menu anime"
      }))

    const media = await prepareWAMessageMedia({ image: { url: BANNER_URL } }, { upload: conn.waUploadToServer })

    let menuTexto = `✦━━━━━━━━━━━━━━━━✦\n`
    menuTexto += `   ${ucapan}, *${m.pushName || 'Usuario'}* ✨\n`
    menuTexto += `   📅 Fecha: ${fecha}\n   🕒 Hora: ${hora}\n`
    menuTexto += `   👤 Creador: Carlos\n`
    menuTexto += `✦━━━━━━━━━━━━━━━━✦\n\n`
    menuTexto += `Presiona el botón de abajo para desplegar las categorías y ver los comandos.`

    const messageInstance = {
      interactiveMessage: {
        body: { text: menuTexto },
        footer: { text: 'ち卄工乙UＫ丹-丹工 • Dev by Carlos' },
        header: {
          title: '✧ PANEL DE CONTROL ✧',
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
