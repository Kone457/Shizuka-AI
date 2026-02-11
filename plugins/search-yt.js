import yts from 'yt-search';
import { getBuffer } from '../lib/message.js';

export default {
  command: ['ytsearch', 'yts', 'search'],
  category: 'internet',
  run: async (client, m, args) => {
    if (!args || !args[0]) {
      return m.reply('✨ *Uso correcto:* Ingresa el nombre del video que deseas buscar.')
    }

    try {
      const query = args.join(' ')
      await m.reply(`> 🔍 *Buscando en YouTube:* "${query}"...`)

      const search = await yts(query)
      const results = search.all.slice(0, 10) 
      if (!results.length) {
        return m.reply('❌ No se encontraron resultados.')
      }

      const mainThumb = await getBuffer(results[0].image || results[0].thumbnail)

      let message = `╔════════════════════╗\n`
      message += `║   🎬 *YOUTUBE EXPLORER* ║\n`
      message += `╚════════════════════╝\n\n`
      
      message += `╔▣ **BÚSQUEDA: ${query.toUpperCase()}**\n`
      message += `┃ ◈ *Resultados:* ${results.length}\n`
      message += `┃ ◈ *Origen:* YouTube Database\n`
      message += `╚════════════════════\n\n`

      let teks2 = results.map((v, index) => {
        const isLast = index === results.length - 1
        
        if (v.type === 'video') {
          return `┏──『 *RESULTADO #${index + 1}* 』──┓\n` +
                 `┃ ◈ *Título:* ${v.title.substring(0, 55)}\n` +
                 `┃ ◈ *Canal:* ${v.author.name}\n` +
                 `┃ ◈ *Duración:* ${v.timestamp} ⏳\n` +
                 `┃ ◈ *Vistas:* ${v.views.toLocaleString()} 👁️\n` +
                 `┃ ◈ *Hace:* ${v.ago}\n` +
                 `┃ ◈ *Link:* ${v.url}\n` +
                 `┗━━━━━━━━━━━━━━━━━━━━┛`
        } else if (v.type === 'channel') {
          return `┏──『 *CANAL ENCONTRADO* 』──┓\n` +
                 `┃ ◈ *Nombre:* ${v.name}\n` +
                 `┃ ◈ *Subs:* ${v.subCountLabel}\n` +
                 `┃ ◈ *Videos:* ${v.videoCount}\n` +
                 `┃ ◈ *Link:* ${v.url}\n` +
                 `┗━━━━━━━━━━━━━━━━━━━━┛`
        }
      })
      .filter((v) => v)
      .join('\n\n')

      message += teks2
      message += `\n\n> 💡 *Tip:* Copia el link y usa *play* para el audio o *mp4* para el video.`

      await client.sendMessage(m.chat, { image: mainThumb, caption: message.trim() }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply('❌ Ocurrió un error al realizar la búsqueda.')
    }
  },
};
