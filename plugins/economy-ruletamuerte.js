const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['ruletamuerte', 'deathroulette'],
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
    const currency = botSettings.currency || 'Monedas'

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    const cooldown = 15 * 60 * 1000
    const now = Date.now()
    const remaining = (user.deathCooldown || 0) - now

    if (remaining > 0)
      return m.reply(`☠️ Debes esperar *${msToTime(remaining)}* para volver a jugar.`)

    const total = (user.coins || 0) + (user.bank || 0)
    if (total <= 0) return m.reply('No tienes nada que apostar...')

    user.deathCooldown = now + cooldown

    const survive = Math.random() < 0.25

    let msg = `☠️ *RULETA DE LA MUERTE*\n\n🎲 Girando...\n`

    await client.sendMessage(chatId, { text: msg }, { quoted: m })

    await new Promise(r => setTimeout(r, 2000))

    if (survive) {
      const reward = Math.floor(total * (2 + Math.random() * 2))
      user.coins += reward

      msg = `🟢 SOBREVIVISTE!\n\n💰 Ganaste *¥${reward.toLocaleString()} ${currency}*\nAhora eres intocable...`
    } else {
      user.coins = 0
      user.bank = 0

      msg = `💀 HAS MUERTO...\n\nPerdiste todas tus ${currency}.\nAdiós...`

      await client.sendMessage(chatId, { text: msg, mentions: [senderId] }, { quoted: m })

      try {
        await client.groupParticipantsUpdate(chatId, [senderId], 'remove')
      } catch (e) {}

      return
    }

    await client.sendMessage(chatId, {
      text: msg,
      mentions: [senderId],
    }, { quoted: m })
  },
}