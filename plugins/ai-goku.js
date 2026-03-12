import axios from 'axios'

const gokuVoice = "67aed50c-5d4b-11ee-a861-00163e2ac61b"

async function tts(text) {

  const payload = {
    raw_text: text,
    url: "https://filme.imyfone.com/text-to-speech/anime-text-to-speech/",
    product_id: "200054",
    convert_data: [{
      voice_id: gokuVoice,
      speed: "1",
      volume: "50",
      text,
      pos: 0
    }]
  }

  const { data } = await axios.post(
    "https://voxbox-tts-api.imyfone.com/pc/v1/voice/tts",
    JSON.stringify(payload),
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    }
  )

  return data.data.convert_result[0].oss_url
}

export default {
  command: ['goku'],
  category: 'ai',

  run: async (client, m, args) => {

    let text = args.join(' ').trim()

    if (!text && m.quoted) {
      text = m.quoted.text || m.quoted.caption || m.quoted.body || ''
    }

    if (!text) return m.reply('Preguntale algo al Goku comediante.')

    try {

      const { key } = await client.sendMessage(
        m.chat,
        { text: 'El Goku comediante esta pensando...' },
        { quoted: m }
      )

      const messages = [
        {
          role: "system",
          content: `Eres una version comediante de Goku.

No eres el Goku original. 
Eres un Goku que hace bromas tontas y responde de forma graciosa.

Personalidad:
Hablas simple.
Dices cosas absurdas.
Confundes cosas normales.
A veces hablas de comida o entrenamiento de forma graciosa.

Reglas:
No uses emojis.
No uses simbolos raros.
Solo texto normal.
Respuestas cortas o medianas.
Siempre intenta que la respuesta sea graciosa.`
        },
        {
          role: "user",
          content: text
        }
      ]

      const params = {
        query: JSON.stringify(messages),
        link: "writecream.com"
      }

      const url =
        "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat?" +
        new URLSearchParams(params)

      const { data } = await axios.get(url)

      let response = String(data?.response_content || "").trim().slice(0, 200)

      if (!response) return m.reply("El Goku comediante se distrajo pensando en comida.")

      const audio = await tts(response)

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audio },
          mimetype: "audio/mp4",
          ptt: true
        },
        { quoted: m }
      )

      await client.sendMessage(m.chat, { delete: key })

    } catch (err) {

      console.log(err)

      m.reply("El Goku comediante intento pensar pero termino comiendo.")
    }
  },
}