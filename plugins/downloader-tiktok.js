import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'tkdl'],
  category: 'downloader',
  run: async (client, m, args, command) => {

    if (!args.length) {
      return m.reply(`✨ *Uso correcto:* Ingresa un término de búsqueda o un enlace de TikTok.`)
    }

    const urls = args.filter(arg => arg.includes("tiktok.com"))

    if (urls.length) {
      for (const url of urls) {
        try {
          await m.reply(`> 📥 *Extrayendo video de TikTok, espere...*`)

          const apiUrl = `${api.url2}/api/v1/download/tiktok?url=${url}`
          const res = await fetch(apiUrl)
          const json = await res.json()

          if (!json.status || !json.result) {
            await m.reply(`❌ No se encontraron resultados para: ${url}`)
            continue
          }

          const result = json.result
          const dl = result.data?.[0]?.url || result.data?.[1]?.url

          if (!dl) {
            await m.reply(`⚠️ El contenido de este enlace no es compatible.`)
            continue
          }

          await client.sendMessage(m.chat, { 
            video: { url: dl }, 
            caption: "Aquí tienes 😘" 
          }, { quoted: m })
          
        } catch (e) {
          await m.reply('❌ Error al procesar el enlace de TikTok.')
        }
      }
    } else {
      const query = args.join(" ")
      try {
        await m.reply(`> 🔍 *Buscando "${query}" en TikTok...*`)

        const apiUrl = `${api.url}/search/tiktok?q=${encodeURIComponent(query)}`
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.status || !json.result || json.result.length === 0) {
          return m.reply(`❌ No se encontraron videos para: ${query}`)
        }

        const data = json.result[0]
        const dl = data.play || data.wmplay

        if (!dl) {
          return m.reply('⚠️ No se pudo obtener un enlace reproducible.')
        }

        return client.sendMessage(m.chat, { 
          video: { url: dl }, 
          caption: "Aquí tienes 😘" 
        }, { quoted: m })
        
      } catch (e) {
        m.reply('❌ Error crítico en la búsqueda de TikTok.')
      }
    }
  },
};