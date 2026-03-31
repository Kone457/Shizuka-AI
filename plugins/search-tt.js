import fetch from 'node-fetch';

export default {
  command: ['tiktoksearch', 'ttsearch', 'tts'],
  category: 'search',
  run: async (client, m, args) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId] || {}
    const botname = botSettings.namebot || 'Yotsuba'
    const banner = botSettings.icon

    if (!args || !args.length) {
      return m.reply(`✨ *Uso correcto:* Ingresa un término para buscar videos en TikTok.`)
    }

    const query = args.join(' ')
    const url = `${api.url}/search/tiktok?q=${encodeURIComponent(query)}&apikey=${api.key}`

    try {
      await m.reply(`> 🔍 *Buscando top resultados para:* "${query}"...`)

      const res = await fetch(url)
      const json = await res.json()

      if (!json.status || !json.result || !json.result.length) {
        return m.reply(`❌ No se encontraron resultados para "${query}".`)
      }

      let message = `╔════════════════════╗\n`
      message += `║   🔎 *TIKTOK EXPLORER* ║\n`
      message += `╚════════════════════╝\n\n`
      
      message += `╔▣ **RESULTADOS DE: ${query.toUpperCase()}**\n`
      message += `┃ ◈ *Total:* ${json.result.length} videos\n`
      message += `╚════════════════════\n\n`

      json.result.forEach((result, index) => {
        const isLast = index === json.result.length - 1
        const author = result.author?.nickname || 'Desconocido'
        const views = result.play_count?.toLocaleString() || '0'
        
        message += `┏──『 *RESULTADO #${index + 1}* 』──┓\n`
        message += `┃ ◈ *Título:* ${result.title?.substring(0, 50) || 'Sin título'}...\n`
        message += `┃ ◈ *Autor:* ${author}\n`
        message += `┃ ◈ *Vistas:* ${views} 👁️\n`
        message += `┃ ◈ *Likes:* ${result.digg_count?.toLocaleString() || 0} ❤️\n`
        message += `┃ ◈ *Duración:* ${result.duration || 'N/A'}\n`
        message += `┃ ◈ *Link:* https://vt.tiktok.com/${result.video_id || result.id}\n`
        message += `┗━━━━━━━━━━━━━━━━━━━━┛\n`
        
        if (!isLast) message += `\n`
      })

      message += `\n> 💡 *Tip:* Usa el comando *playvideo* con el link para descargar.`

      await client.sendMessage(
        m.chat,
        {
          image: { url: banner },
          caption: message.trim(),
        },
        { quoted: m },
      )
    } catch (e) {
      console.error(e)
      await m.reply('❌ Fallo crítico en el motor de búsqueda de TikTok.')
    }
  },
};
