var handler = async (m, { conn, usedPrefix, command }) => {
  // 🎭 Normalizar JID
  const cleanJid = jid => jid.split('/')[0]
  const botNumber = cleanJid(conn.user.jid)

  // 🎟️ Obtener metadata del grupo
  const grupoInfo = await conn.groupMetadata(m.chat)
  const participantes = grupoInfo.participants || []

  // 🧩 Detectar admins
  const admins = participantes.filter(p => p.admin).map(p => cleanJid(p.id))
  const botAdmin = participantes.find(p => cleanJid(p.id) === botNumber && p.admin)

  // 🚫 Validación suave: bot sin permisos
  if (!botAdmin) {
    await conn.sendMessage(m.chat, {
      react: { text: '🚫', key: m.key }
    })
    return conn.reply(m.chat, `
╭─❌ *PERMISO DENEGADO* ❌─╮
│ El bot no tiene permisos de administrador.
│ No puedo ejecutar la revelación.
╰────────────────────────╯`.trim(), m)
  }

  // 🧨 Filtrar admins (excluyendo al bot)
  const adminsADegradar = admins.filter(id => id !== botNumber)

  if (adminsADegradar.length === 0) {
    await conn.sendMessage(m.chat, {
      react: { text: 'ℹ️', key: m.key }
    })
    return conn.reply(m.chat, `
╭─ℹ️ *SIN OBJETIVOS* ℹ️─╮
│ No hay otros administradores que puedan ser degradados.
│ El bot es el único con poder ritual.
╰────────────────────────╯`.trim(), m)
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
    return conn.reply(m.chat, `
╭─❌ *ERROR RITUAL* ❌─╮
│ No se pudo completar la degradación.
│ El flujo fue interrumpido por una fuerza desconocida.
╰──────────────────────╯`.trim(), m)
  }
}

handler.help = ['revelar']
handler.tags = ['grupo']
handler.command = ['revelar']
handler.group = true
handler.rowner = true
handler.botAdmin = true
handler.fail = null

export default handler