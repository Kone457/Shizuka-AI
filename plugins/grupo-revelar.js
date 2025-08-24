var handler = async (m, { conn, usedPrefix, command }) => {
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

  // 🧨 Filtrar admins (excluyendo al bot)
  const adminsADegradar = admins.filter(id => id !== botNumber)

  if (adminsADegradar.length === 0) {
    await conn.sendMessage(m.chat, {
      react: { text: 'ℹ️', key: m.key }
    })
    return conn.reply(m.chat, `ℹ️ *No hay otros administradores que puedan ser degradados.*`, m)
  }

  // 🔽 Degradar en masa
  try {
    await conn.groupParticipantsUpdate(m.chat, adminsADegradar, 'demote')
    await conn.sendMessage(m.chat, {
      react: { text: '🧨', key: m.key }
    })

    const lista = adminsADegradar.map(jid => `• @${jid.split('@')[0]}`).join('\n')

    const mensaje = `
╭━〔 🧨 *REVELACIÓN ACTIVADA* 〕━╮
┃ 🔻 Todos los administradores han sido degradados.
┃ 🏷️ Grupo: *${grupoInfo.subject}*
┃ 👥 Afectados:
${lista}
┃ ⚠️ El poder ha sido redistribuido...
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim()

    return conn.reply(m.chat, mensaje, m, { mentions: adminsADegradar })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    })
    return conn.reply(m.chat, `❌ *Error al degradar a los administradores.*`, m)
  }
}

handler.help = ['revelar']
handler.tags = ['grupo']
handler.command = ['revelar']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.fail = null

export default handler