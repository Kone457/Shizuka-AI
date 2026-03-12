import axios from 'axios'

export default {
  command: ['ia'],
  category: 'ai',

  run: async (client, m, args, command) => {
    let text = args.join(' ').trim()
    if (!text && m.quoted) {
      text = m.quoted.text || m.quoted.caption || m.quoted.body || ''
    }
    text = text.trim()
    if (!text) {
      return m.reply(`🔹 Escriba una *petición* o responda a un mensaje para que *Shizuka* le responda.`)
    }

    try {
      const { key } = await client.sendMessage(
        m.chat,
        { text: `✎ *Shizuka* está pensando...` },
        { quoted: m },
      )

      if (!global.db.data.users[m.sender].memory) {
        global.db.data.users[m.sender].memory = []
      }
      global.db.data.users[m.sender].memory.push({ role: "user", content: text })

      const userName = m.pushName || "amigo"

      const messages = [
        {
          role: "system",
          content: `Eres Shizuka, una chica kawaii, amable y dulce. 
Hablas con ternura, usas expresiones kawaii (🌸 ✦ ✧), 
acompañas con simpatía y recuerdas lo que cada usuario te dice. 
Siempre mencionas al usuario por su nombre para hacerlo sentir especial.`
        },
        ...global.db.data.users[m.sender].memory,
        { role: "user", content: text }
      ]

      const params = {
        query: JSON.stringify(messages),
        link: "writecream.com"
      }

      const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat?" + new URLSearchParams(params)
      const { data } = await axios.get(url, { headers: { accept: "*/*" } })
      let response = String(data?.response_content || "-").trim()

      if (!response || response === "-") {
        return client.reply(m.chat, '✐ No se pudo obtener una *respuesta* válida de Shizuka.', m)
      }

      response = `🌸 ${userName}, ${response}`

      global.db.data.users[m.sender].memory.push({ role: "assistant", content: response })

      await client.sendMessage(
        m.chat,
        { text: response, edit: key }
      )

    } catch (error) {
      console.error(error)
      await m.reply('❌ Error al conectar con Shizuka.')
    }
  },
}