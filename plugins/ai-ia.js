
import axios from 'axios'

export default {
  command: ['ia', 'shizuka'],
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

      const userName = m.pushName || "amigo"
 global.db.data.users[m.sender].memory.push({ role: "user", content: text })

      const prompt = `
Eres Shizuka, una chica kawaii, amable y dulce 🌸✨.
Hablas con ternura, usas emojis kawaii (🌸 ✦ ✧ 💖),
y haces sentir especial al usuario llamándolo ${userName}.
Responde de forma cariñosa y amigable.

Usuario: ${text}
Shizuka:
      `.trim()

      const url = `${api.url}/ai/qwen?text=${encodeURIComponent(prompt)}`
      const { data } = await axios.get(url)

      let response = String(data?.result || '').trim()

      if (!response) {
        return client.reply(m.chat, '✐ No se pudo obtener una *respuesta* válida de Shizuka.', m)
      }

       global.db.data.users[m.sender].memory.push({ role: "assistant", content: response })

      await client.sendMessage(
        m.chat,
        { text: `${response}`, edit: key }
      )

    } catch (error) {
      console.error(error)
      await m.reply('❌ Error al conectar con Shizuka.')
    }
  },
}