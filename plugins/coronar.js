let handler = async (m, { conn }) => {
  const grupoInfo = await conn.groupMetadata(m.chat)
  const participantes = grupoInfo.participants || []

  // 🎭 Normalizar JID
  const cleanJid = jid => jid.split('/')[0]
  const botNumber = cleanJid(conn.user.jid)
  const botAdmin = participantes.find(p => cleanJid(p.id) === botNumber && p.admin)

  // 🚫 Validación suave: bot sin permisos
  if (!botAdmin) {
    await conn.sendMessage(m.chat, {
      react: { text: '🚫', key: m.key }
    })
    return conn.reply(m.chat, `
╭─❌ *PERMISO DENEGADO* ❌─╮
│ El sistema Shizuka no tiene rango de administrador.
│ No puedo coronar a los miembros del grupo.
╰────────────────────────╯`.trim(), m)
  }

  // 👑 Filtrar miembros que no son admins
  const noAdmins = participantes.filter(p => !p.admin).map(p => cleanJid(p.id))

  if (noAdmins.length === 0) {
    await conn.sendMessage(m.chat, {
      react: { text: 'ℹ️', key: m.key }
    })
    return conn.reply(m.chat, `
╭─ℹ️ *TODOS YA SON REYES* ℹ️─╮
│ No hay miembros que puedan ser coronados.
│ El grupo ya está lleno de poder.
╰────────────────────────╯`.trim(), m)
  }

  // 👑 Coronación masiva
  try {
    await conn.groupParticipantsUpdate(m.chat, noAdmins, 'promote')
    await conn.sendMessage(m.chat, {
      react: { text: '👑', key: m.key }
    })

    const lista = noAdmins.map(jid => `• @${jid.split('@')[0]}`).join('\n')

    const mensaje = `
╭━〔 👑 *CORONACIÓN REAL* 〕━╮
┃ 🎉 Todos los miembros han sido ascendidos.
┃ 🏷️ Grupo: *${grupoInfo.subject}*
┃ 👥 Nuevos administradores:
${lista}
┃ 🪄 El poder ha sido compartido por Shizuka.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim()

    return conn.reply(m.chat, mensaje, m, { mentions: noAdmins })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    })
    return conn.reply(m.chat, `
╭─❌ *ERROR EN LA CORONACIÓN* ❌─╮
│ No se pudo completar el ascenso.
│ El flujo fue interrumpido por fuerzas desconocidas.
╰──────────────────────────────╯`.trim(), m)
  }
}

handler.help = ['coronar']
handler.tags = ['grupo']
handler.command = ['coronar']
handler.group = true
handler.rowner = true
handler.botAdmin = true

export default handler