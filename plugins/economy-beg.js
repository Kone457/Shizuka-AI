const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['vagabundear', 'beg'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'

    if (!db.settings[botId]) db.settings[botId] = {}
    if (!db.chats[chatId]) db.chats[chatId] = {}
    if (!db.chats[chatId].users) db.chats[chatId].users = {}
    if (!db.chats[chatId].users[senderId]) db.chats[chatId].users[senderId] = { coins: 0, bank: 0 }

    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]
    const user = chatData.users[senderId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    const cooldown = 5 * 60 * 1000
    const now = Date.now()
    const remaining = (user.begCooldown || 0) - now
    const currency = botSettings.currency || 'Monedas'

    if (remaining > 0)
      return m.reply(`Debes esperar *${msToTime(remaining)}* antes de volver a intentar.`)

    const success = Math.random() < 0.8
    const amount = Math.floor(Math.random() * 500) + 1

    user.begCooldown = now + cooldown

    const successMessages = [
      `Una persona amable te dio *¥${amount.toLocaleString()} ${currency}*.`,
      `Alguien sintió lástima y te regaló *¥${amount.toLocaleString()} ${currency}*.`,
      `Recibiste ayuda en la calle y ganaste *¥${amount.toLocaleString()} ${currency}*.`,
      `Un desconocido te apoyó con *¥${amount.toLocaleString()} ${currency}*.`,
      `Tu suerte cambió y obtuviste *¥${amount.toLocaleString()} ${currency}*.`,
    ]

    const failMessages = [
      `Nadie te hizo caso esta vez...`,
      `Intentaste pedir dinero pero no tuviste suerte.`,
      `La gente te ignoró completamente.`,
      `Hoy no fue tu día para conseguir ayuda.`,
      `No lograste obtener nada esta vez.`,
    ]

    let message

    if (success) {
      user.coins += amount
      message = successMessages[Math.floor(Math.random() * successMessages.length)]
    } else {
      message = failMessages[Math.floor(Math.random() * failMessages.length)]
    }

    await client.sendMessage(
      chatId,
      {
        text: message,
        mentions: [senderId],
      },
      { quoted: m }
    )
  },
}