import fetch from 'node-fetch';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

global.geminiMemory ||= {}

async function getAnonCookie() {
  const r = await fetch(
    'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&hl=es&rt=c',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'user-agent': UA
      },
      body: 'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
    }
  )
  return r.headers.get('set-cookie').split(';')[0]
}

async function askGemini(prompt) {
  const cookie = await getAnonCookie()

  const payload = [[prompt], ['es']]
  const params = { 'f.req': JSON.stringify([null, JSON.stringify(payload)]) }

  const res = await fetch(
    'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?hl=es&rt=c',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'user-agent': UA,
        cookie
      },
      body: new URLSearchParams(params),
    }
  )

  const text = await res.text()
  const match = text.match(/"([^"]{10,})"/g)
  if (!match) return null

  return match[0].replace(/"/g, '')
}

export default {
  command: ['gemini', 'gemi'],
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

    if (!text) {
      return m.reply(`🔹 Escriba una *petición* o responda a un mensaje para que *Gemini* le responda.`)
    }

    const userId = m.sender
    const username = m.pushName || 'Usuario'

    if (!global.geminiMemory[userId]) {
      global.geminiMemory[userId] = []
    }

    const history = global.geminiMemory[userId]

    const context = history.slice(-20).map(x => `${x.role}: ${x.content}`).join('\n')

    const finalPrompt = `${context}\nUsuario (${username}): ${text}`

    try {
      const { key } = await client.sendMessage(
        m.chat,
        { text: `✎ *Gemini* está pensando, @${userId.split('@')[0]}...`, mentions: [userId] },
        { quoted: m },
      )

      const response = await askGemini(finalPrompt)

      if (!response) {
        return client.reply(m.chat, '✐ No se pudo obtener una *respuesta* válida', m)
      }

      history.push({ role: `Usuario (${username})`, content: text })
      history.push({ role: 'Gemini', content: response })

      if (history.length > 100) {
        global.geminiMemory[userId] = history.slice(-100)
      }

      const finalText = `👤 @${userId.split('@')[0]}\n\n${response}`

      await client.sendMessage(
        m.chat,
        {
          text: finalText,
          mentions: [userId],
          edit: key
        }
      )

    } catch (error) {
      console.error(error)
      await m.reply(msgglobal)
    }
  },
}