const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['gallos', 'apostargallos', 'gallo'],
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

    const cooldown = 3 * 60 * 1000
    const now = Date.now()
    const remaining = (user.gallosCooldown || 0) - now
    const currency = botSettings.currency || 'Monedas'

    if (remaining > 0)
      return m.reply(`Debes esperar *${msToTime(remaining)}* para volver a apostar.`)

    const text = m.text || ''
    const args = text.trim().split(/\s+/).slice(1)

    const bet = parseInt(args[0])

    if (!bet || isNaN(bet) || bet <= 0)
      return m.reply(`Ingresa una cantidad válida.\nEjemplo: *.gallos 500*`)

    if (user.coins < bet)
      return m.reply(`No tienes suficientes ${currency}.`)

    const roosterA = ['Furia Roja', 'Rayo Mortal', 'Sombra', 'Destructor', 'El Diablo']
    const roosterB = ['Trueno', 'Colmillo', 'Relámpago', 'Titan', 'Bestia']

    const a = roosterA[Math.floor(Math.random() * roosterA.length)]
    const b = roosterB[Math.floor(Math.random() * roosterB.length)]

    const win = Math.random() < 0.5

    user.gallosCooldown = now + cooldown

    let message = `🐓 *Pelea de Gallos*\n\n`
    message += `🔴 ${a} vs 🔵 ${b}\n\n`

    if (win) {
      const reward = Math.floor(bet * (1 + Math.random()))
      user.coins += reward
      message += `🏆 Tu gallo ganó!\nGanaste *¥${reward.toLocaleString()} ${currency}*`
    } else {
      user.coins -= bet
      message += `💀 Tu gallo perdió...\nPerdiste *¥${bet.toLocaleString()} ${currency}*`
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