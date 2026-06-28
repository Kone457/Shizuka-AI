import axios from 'axios'
import * as cheerio from 'cheerio'

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const { data } = await axios.get('https://www.unionelectrica.cu/nota-informativa/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    })

    const $ = cheerio.load(data)
    const primerArticulo = $('article').first()

    let cuerpoNota = ''
    primerArticulo.find('p').each((i, el) => {
      const texto = $(el).text().trim()
      if (texto.length > 5) cuerpoNota += `${texto}\n\n`
    })

    if (!cuerpoNota) {
      cuerpoNota = $('.entry-content').first().text().trim().substring(0, 800)
    }

    const reporte = `📢 *Informe oficial de la Unión Eléctrica*\n\n${cuerpoNota || 'No hay información disponible en este momento.'}\n\n> ⚡ Manténgase preparado y tome las medidas necesarias.`

    await conn.sendMessage(m.chat, {
      image: { url: 'https://www.unionelectrica.cu/wp-content/uploads/2025/01/nota-informativa.png' },
      caption: reporte
    }, { quoted: m })

  } catch (e) {
    await conn.reply(
      m.chat,
      '⚠️ No fue posible obtener el informe de la Unión Eléctrica en este momento.\n> Intente nuevamente más tarde.',
      m
    )
  }
}

handler.command = ['luz']
handler.help = ['luz']
handler.tags = ['info']
handler.group = false

export default handler