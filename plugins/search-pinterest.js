import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',

  run: async (client, m, args) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)

    if (!text) {
      return m.reply(`Ingresa un *término* de búsqueda o un enlace de *Pinterest*.`)
    }

    try {

      if (isPinterestUrl) {

        const res = await fetch(`${api.url}/download/pinterest?url=${encodeURIComponent(text)}&apikey=${api.key}`)
        const json = await res.json()

        const result = json?.result

        if (!json.status || !result?.dl) {
          return m.reply('Error al procesar el enlace de Pinterest.')
        }

        const message2 =
          `> ➩ Resultado de Pinterest\n` +
          `✐ Título › *${result.titulo}*`

        await client.sendMessage(
          m.chat,
          { image: { url: result.dl }, caption: message2 },
          { quoted: m }
        )

      } else {

        const res = await fetch(`${api.url}/search/pinterest?q=${encodeURIComponent(text)}&apikey=${api.key}`)
        const json = await res.json()

        if (!json.status || !json.result?.length) {
          return m.reply(`✐ No se encontraron resultados para *${text}*`)
        }

        const result = json.result[Math.floor(Math.random() * json.result.length)]

        const image =
          result.image_large_url ||
          result.image_medium_url ||
          result.image_small_url

        if (!image) return m.reply('No se encontró imagen válida.')

        const message =
          `➩  Resultados para › *${text}*\n\n` +
          `ꕥ Título › *${result.titulo}*`

        await client.sendMessage(
          m.chat,
          { image: { url: image }, caption: message },
          { quoted: m }
        )
      }

    } catch (e) {
      console.log(e)
      return m.reply('Error inesperado al buscar en Pinterest.')
    }
  },
}