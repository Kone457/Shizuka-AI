import axios from "axios"
import * as cheerio from "cheerio"

async function ttp(text, tcolor = "30F4EF") {
  try {
    const params = new URLSearchParams({
      TextToRender: text,
      FontSize: "100",
      Margin: "30",
      LayoutStyle: "0",
      TextRotation: "0",
      TextColor: tcolor,
      TextTransparency: "0",
      OutlineThickness: "3",
      OutlineColor: "000000",
      FontName: "Lekton",
      ResultType: "view"
    })

    const { data } = await axios.post(
      "https://www.picturetopeople.org/p2p/text_effects_generator.p2p/transparent_text_effect",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    )

    const $ = cheerio.load(data)
    const result = "https://www.picturetopeople.org" + $("#idResultFile").attr("value")

    return {
      status: 200,
      result
    }
  } catch (err) {
    return {
      status: 500,
      error: err.message
    }
  }
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, '《✧》 Ingresa el texto.', m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    const query = args.join(' ')
    const res = await ttp(query)

    if (!res || !res.result) {
      return conn.reply(m.chat, '❏ No se pudo generar la imagen.', m)
    }

    await conn.sendFile(m.chat, res.result, 'text.png', `✿ Texto generado: ${query}`, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.reply(m.chat, `❏ Error al generar.\n❏ Detalles: ${e.message}`, m)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.command = ['ttp']
handler.tags = ['tools']
handler.help = ['ttp']
handler.group = true

export default handler