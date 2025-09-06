var handler = async (m, { conn, usedPrefix, command, text }) => {
  const grupoInfo = await conn.groupMetadata(m.chat)
  const participantes = grupoInfo.participants || []
  const admins = participantes.filter(p => p.admin).map(p => p.id)
  const botNumber = conn.user.jid
  const botAdmin = participantes.find(p => p.id === botNumber && p.admin)

  // 🚫 Bot sin permisos
  if (!botAdmin) {
    await conn.sendMessage(m.chat, {
      react: { text: '🚫', key: m.key }
    })
    return conn.reply(m.chat, `🚫 *No tengo permisos de administrador en este grupo.*`, m)
  }

  // 📍 Detectar número o mención
  let number = ''
  if (text) {
    number = text.replace(/\D/g, '')
  } else if (m.quoted) {
    number = m.quoted.sender.split('@')[0]
  }

  if (!number || number.length < 8 || number.length > 13) {
    await conn.sendMessage(m.chat, {
      react: { text: '❓', key: m.key }
    })
    return conn.reply(m.chat, `⚠️ *Debes mencionar o responder a un usuario válido para coronar.*`, m)
  }

  const userJid = number + '@s.whatsapp.net'

  // ✅ Ya es admin
  if (admins.includes(userJid)) {
    await conn.sendMessage(m.chat, {
      react: { text: '👑', key: m.key }
    })
    return conn.reply(m.chat, `ℹ️ @${number} *ya porta la corona de administrador.*`, m, { mentions: [userJid] })
  }

  // 🎭 Ceremonia real
  const ceremonia = [
    '🎺 *Los heraldos anuncian el ritual...*',
    '🕊️ El aire se llena de solemnidad...',
    '👁️‍🗨️ Las miradas se posan sobre @user...',
    '💫 El aura del elegido comienza a brillar...',
    '📜 Se desenrolla el pergamino de la nobleza...',
    '👑 La corona se eleva lentamente...',
    '🌟 *¡La coronación está en marcha!*',
    '🧿 El círculo de poder se cierra sobre @user...',
    '🪄 *¡Admin otorgado con bendición ancestral!*',
    '🎆 *El reino celebra a su nuevo protector.*'
  ]

  for (let i = 0; i < ceremonia.length - 2; i++) {
    const txt = ceremonia[i].replace('@user', '@' + number)
    await conn.sendMessage(m.chat, { text: txt, mentions: [userJid] }, { quoted: m })
    await new Promise(r => setTimeout(r, 700 + i * 90))
  }

  // 🔼 Coronación
  try {
    await conn.groupParticipantsUpdate(m.chat, [userJid], 'promote')
    await conn.sendMessage(m.chat, {
      react: { text: '🎖️', key: m.key }
    })

    const mensajeFinal = ceremonia.slice(-2).map(txt =>
      txt.replace('@user', '@' + number)
    )

    await conn.sendMessage(m.chat, { text: mensajeFinal[0], mentions: [userJid] }, { quoted: m })
    await new Promise(r => setTimeout(r, 400))
    await conn.sendMessage(m.chat, { text: mensajeFinal[1] }, { quoted: m })

    const pergamino = `
╭━━━〔 👑 *CORONACIÓN REALIZADA* 〕━━━╮
┃ 🧍 Usuario: @${number}
┃ 🏷️ Grupo: *${grupoInfo.subject}*
┃ 📜 Rango otorgado: *Administrador*
┃ 🎉 ¡La corona ha sido colocada con honor!
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim()

    return conn.reply(m.chat, pergamino, m, { mentions: [userJid] })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    })
    return conn.reply(m.chat, `❌ *No se pudo coronar a @${number}. Tal vez el destino se opuso...*`, m, { mentions: [userJid] })
  }
}

handler.help = ['coronar']
handler.tags = ['grupo', 'ceremonia']
handler.command = ['coronar']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.fail = null

export default handler