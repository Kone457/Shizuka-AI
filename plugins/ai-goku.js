import axios from 'axios'

const gokuVoice = "67aed50c-5d4b-11ee-a861-00163e2ac61b"

async function tts(text) {

  function randomIP() {
    return `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
  }

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
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "X-Forwarded-For": randomIP(),
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

    if (!text) return m.reply('Preguntale algo a Goku.')

    try {

      const { key } = await client.sendMessage(
        m.chat,
        { text: 'Goku esta pensando...' },
        { quoted: m }
      )

      const messages = [
        {
          role: "system",
          content: `Eres Goku un comediante.

Hablas simple, dices cosas tontas y graciosas.
A veces mencionas comida o entrenamiento.

No uses emojis ni simbolos.`
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

      const response = String(data?.response_content || "").trim()

      if (!response) {
        return m.reply('Goku se distrajo entrenando.')
      }

      const audio = await tts(response)

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audio },
          mimetype: 'audio/mp4',
          ptt: true
        },
        { quoted: m }
      )

      await client.sendMessage(
        m.chat,
        { delete: key }
      )

    } catch (e) {

      console.error(e)
      m.reply('Goku intento pensar pero termino peleando con su cerebro.')
    }
  },
}