import moment from 'moment-timezone'
import fetch from 'node-fetch'

const BANNER_URL = 'https://files.catbox.moe/a8e4fl.jpg'
const AUDIO_URL = 'https://raw.githubusercontent.com/Kone457/Nexus/main/Audios/Audio.mp3'

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

    let menuTexto = `✦━━━━━━━━━━━━━━━✦\n`
    menuTexto += `   ${ucapan}, ${m.pushName || 'Usuario'} ✨\n`
    menuTexto += `   Comandos activos: ${pluginsCount}\n`
    menuTexto += `   📅 Fecha: ${fecha} \n   🕒 Hora: ${hora}\n`
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

    // 1. PRIMERO enviar el menú
    await conn.sendMessage(m.chat, {
      text: menuTexto.trim(),
      ...metaMsg
    }, { quoted: m })

    // Pequeño delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // 2. DESPUÉS intentar enviar el audio de diferentes formas
    try {
      // Primero probar con URL directa
      await conn.sendMessage(m.chat, {
        audio: { url: AUDIO_URL },
        mimetype: 'audio/mpeg',
        fileName: 'intro_menu.mp3',
        caption: '🎧 *Audio de presentación*',
        ptt: false
      }, { quoted: m })
      
    } catch (err) {
      console.log('❌ Método 1 falló:', err.message)
      
      try {
        // Método 2: Usar audio alternativo MP3 que SÍ funciona
        await conn.sendMessage(m.chat, {
          audio: { url: 'https://files.catbox.moe/znfd0w.mp3' },
          mimetype: 'audio/mpeg',
          fileName: 'intro_bot.mp3',
          caption: '🎵 *Audio intro*',
          ptt: false
        }, { quoted: m })
        
      } catch (err2) {
        console.log('❌ Método 2 falló:', err2.message)
        
        try {
          // Método 3: Descargar el audio primero y enviarlo como buffer
          const response = await fetch('https://files.catbox.moe/znfd0w.mp3')
          const audioBuffer = await response.buffer()
          
          await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: 'audio_menu.mp3',
            caption: '🔊 *Audio descargado*',
            ptt: false
          }, { quoted: m })
          
        } catch (err3) {
          console.log('❌ Método 3 falló:', err3.message)
          
          // Método 4: Enviar como documento si todo falla
          await conn.sendMessage(m.chat, {
            document: { url: 'https://files.catbox.moe/znfd0w.mp3' },
            fileName: 'audio_intro.mp3',
            mimetype: 'audio/mpeg',
            caption: '📁 *Audio (descargar para escuchar)*'
          }, { quoted: m })
        }
      }
    }

  } catch (e) {
    console.error("❌ Error general en menú:", e)
    await conn.sendMessage(m.chat, { 
      text: `⚠️ Error: ${e.message || 'Desconocido'}` 
    }, { quoted: m })
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']
export default handler