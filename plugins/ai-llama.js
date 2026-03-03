import fetch from 'node-fetch';

export default {
  command: ['ia', 'llama'],
  category: 'ai',

  run: async (client, m, args, command) => {

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isPremiumBot = global.db.data.settings[botId]?.botprem === true
    const isModBot = global.db.data.settings[botId]?.botmod === true

    if (!isOficialBot && !isPremiumBot && !isModBot) {
      return client.reply(m.chat, `🔹 El comando *${command}* no esta disponible en *Sub-Bots.*`, m)
    }

    
    let text = args.join(' ').trim()

    
    if (!text && m.quoted) {
      text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.body ||
        ''
    }

    text = text.trim().toLowerCase()

    if (!text) {
      return m.reply(`🔹 Escriba una *petición* o responda a un mensaje para que *Llama* le responda.`)
    }

    const apiUrl = `${api.url}/ai/llama?text=${encodeURIComponent(text)}`

    try {
      const { key } = await client.sendMessage(
        m.chat,
        { text: `✎ *Llama* está procesando tu respuesta...` },
        { quoted: m },
      )

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json || !json.result) {
        return client.reply(m.chat, '✐ No se pudo obtener una *respuesta* válida', m)
      }

      const response = String(json.result).trim()

      await client.sendMessage(
        m.chat,
        { text: response, edit: key }
      )

    } catch (error) {
      console.error(error)
      await m.reply(msgglobal)
    }
  },
}