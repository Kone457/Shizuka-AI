import axios from 'axios'
import * as cheerio from 'cheerio'

const handler = async (m, { conn }) => {
  try {
    const url = 'https://www.unionelectrica.cu/nota-informativa/'
    
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: 15000
    })

    const $ = cheerio.load(data)

    const titulo = $('meta[property="og:title"]').attr('content') || 'حالة الكهرباء'
    const fecha = $('meta[property="og:updated_time"]').attr('content') || $('meta[property="article:modified_time"]').attr('content')
    const fechaFormateada = fecha ? new Date(fecha).toLocaleString('es-CU', {timeZone: 'America/Havana'}) : 'Hoy'

    let texto = ''
    $('.entry-content p, .entry-content li').each((i, el) => {
      const p = $(el).text().trim().replace(/\s+/g, ' ')
      if (p.length > 15 && !/leer más|compartir|facebook/i.test(p)) {
        texto += p + '\n\n'
      }
    })

    if (!texto) {
      texto = $('meta[property="og:description"]').attr('content') || 'مقدرتش أقرأ الخبر.'
    }

    const tienePico = /horario pico|Disponibilidad|Demanda|Afec/i.test(texto)
    const resumen = tienePico 
      ? texto.split('\n\n').filter(p => /pico|MW|disponibilidad|demanda|afect/i.test(p)).join('\n\n')
      : texto.substring(0, 900)

    const reporte = `📢 *${titulo}*\n🗓️ ${fechaFormateada}\n\n${resumen}\n\n> ⚡ خلّيك متابع. المصدر: شركة الكهرباء`

    await conn.sendMessage(m.chat, {
      image: { url: 'https://www.unionelectrica.cu/wp-content/uploads/2025/01/nota-informativa.png' },
      caption: reporte
    }, { quoted: m })

  } catch (e) {
    await conn.reply(
      m.chat,
      '⚠️ مقدرتش أجيب تقرير الكهرباء.\n> يمكن الموقع واقع أو غيّر شكله.',
      m
    )
  }
}

handler.command = ['luz', 'une', 'apagon']
handler.help = ['luz']
handler.tags = ['info']
handler.group = false

export default handler