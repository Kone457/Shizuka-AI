
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
  gacha: '🎟️ Gacha',
  grupo: '👥 Comandos de Grupo',
  text: '✒️ Efectos de Texto',
  rpg: '🪄 RPG y Economía',
  sticker: '🧧 Stickers',
  tools: '🔧 Herramientas Útiles',
  nsfw: '🔞 Contenido +18',
  serbot: '🤖 Sub-Bot',
  owner: '👑 Comandos de Owner'
}

let handler = async (m, { conn, usedPrefix }) => {
  try {

    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })

    const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
    const pluginsCount = pluginsActivos.length

    const jam = moment.tz('America/Bogota').format('HH:mm:ss')
    const ucapan = jam < '11:00:00' ? '🌅 Buen día' : jam < '19:00:00' ? '☀️ Buenas tardes' : '🌙 Buenas noches'
    const fecha = moment.tz('America/Bogota').format('DD/MM/YYYY')
    const hora = moment.tz('America/Bogota').format('hh:mm A')

    const byTag = {}
    for (const plugin of pluginsActivos) {
      const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
      const helps = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : [])
      for (const tag of tags) {
        if (!CATEGORY_META[tag]) continue
        if (!byTag[tag]) byTag[tag] = new Set()
        for (const h of helps) if (typeof h === 'string' && h.trim()) byTag[tag].add(h.trim())
      }
    }

    const isSubBot = (conn.user.jid !== global.conn?.user?.jid) && !!global.conn?.user?.jid
    const botType = isSubBot ? 'Sub-Bot' : 'Principal'

    let menuTexto = `✦━━━━━━━━━━━━━━━✦\n`
    menuTexto += `   ${ucapan}, ${m.pushName || 'Usuario'} ✨\n`
    menuTexto += `   Comandos activos: ${pluginsCount}\n`
    menuTexto += `   📅 Fecha: ${fecha} \n   🕒 Hora: ${hora}\n`
    menuTexto += `   Bot: ${botType}\n`
    menuTexto += `✦━━━━━━━━━━━━━━━✦\n\n`
    menuTexto += `   ❖ Menú del Bot ❖\n`

    for (const tag of Object.keys(CATEGORY_META)) {
      const set = byTag[tag]
      if (!set || set.size === 0) continue
      const cmds = [...set].sort()
      menuTexto += `╭─❖ ${CATEGORY_META[tag]} ❖─╮\n`
      menuTexto += cmds.map(c => `│ • ${usedPrefix}${c}`).join('\n') + '\n'
      menuTexto += `╰───────────────╯\n\n`
    }

    const metaMsg = {
      contextInfo: {
        externalAdReply: {
          title: '✧ ち卄工乙UＫ丹-丹工  ✧',
          body: '𝓢𝓾𝓹𝓮𝓻 𝓑𝓸𝓽 𝓭𝓮 𝓦𝓱𝓪𝓽𝓼𝓐𝓹𝓹',
          thumbnailUrl: BANNER_URL,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    await conn.sendMessage(m.chat, {
      text: menuTexto.trim(),
      ...metaMsg
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: `🕸 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']
export default handler
