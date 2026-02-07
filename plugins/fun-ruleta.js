let handler = async (m, { conn, participants, groupMetadata }) => {
  const groupId = m.chat
  const sender = m.sender
  
  if (!m.isGroup) return m.reply('🎰 *Esta ruleta solo funciona en grupos*\n\n💔 Ella te dejó por querer jugar solo')
  
  await conn.sendMessage(m.chat, {
    react: {
      text: '💀',
      key: m.key
    }
  })
  
  let balas = 6
  let posicionBala = Math.floor(Math.random() * balas) + 1
  
  let perder = Math.random() < 0.98
  let giro = perder ? posicionBala : Math.floor(Math.random() * (balas - 1)) + 1
  if (giro === posicionBala && !perder) giro = (giro % balas) + 1
  
  let mensajeRuleta = `🔫 *RULETA RUSA DEL DESTINO*\n\n`
  mensajeRuleta += `🎰 *Girado en posición:* ${giro}\n`
  mensajeRuleta += `💀 *Bala en posición:* ${posicionBala}\n\n`
  mensajeRuleta += `🤡 *Jugador:* @${sender.split('@')[0]}\n`
  mensajeRuleta += `💔 *Ella te observa... esperando tu fin*`
  
  await conn.reply(m.chat, mensajeRuleta, m, {
    mentions: [sender]
  })
  
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  if (giro === posicionBala) {
    let mensajeMuerte = `💥 *¡BANG!*\n\n`
    mensajeMuerte += `🔫 @${sender.split('@')[0]} *PERDIÓ LA RULETA*\n`
    mensajeMuerte += `💀 *La bala estaba en la posición ${posicionBala}*\n\n`
    mensajeMuerte += `🖕 *Ella tenía razón... siempre fuiste un perdedor*\n`
    mensajeMuerte += `😭 *Adiós para siempre, patético*`
    
    await conn.reply(m.chat, mensajeMuerte, m, {
      mentions: [sender]
    })
    
    try {
      await conn.groupParticipantsUpdate(groupId, [sender], 'remove')
    } catch (error) {
      await conn.reply(m.chat, `🤡 *No pude eliminarte... pero ella igual te dejará*`, m)
    }
  } else {
    let mensajeVivo = `✅ *¡CLICK!*\n\n`
    mensajeVivo += `🎉 @${sender.split('@')[0]} *SOBREVIVIÓ*\n`
    mensajeVivo += `🔫 *La bala estaba en la posición ${posicionBala}*\n\n`
    mensajeVivo += `💔 *Ella se decepciona... quería verte sufrir*\n`
    mensajeVivo += `😏 *Por esta vez te salvas, pero ella igual te dejará*`
    
    await conn.reply(m.chat, mensajeVivo, m, {
      mentions: [sender]
    })
  }
}

handler.help = ['ruleta', 'ruletarusa']
handler.tags = ['game']
handler.command = ['ruleta', 'ruletarusa', 'suerte']
handler.group = true
handler.botAdmin = true
handler.admin = false

export default handler