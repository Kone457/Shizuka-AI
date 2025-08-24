let handler = async (m, { conn, usedPrefix, command }) => {
  const grupoInfo = await conn.groupMetadata(m.chat)
  const participantes = grupoInfo.participants || []

  // 🎭 Normalizar JID
  const cleanJid = jid => jid.split('/')[0]
  const botNumber = cleanJid(conn.user.jid)

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
│ El sistema Shizuka no tiene rango de administrador.
│ No puedo ejecutar la revelación.
╰────────────────────────╯`.trim(), m)
  }

  // 🎯 Filtrar admins (excluyendo al bot)
  const adminsADegradar = admins.filter(id => id !== botNumber)

  if (adminsADegradar.length === 0) {
    await conn.sendMessage(m.chat, {
      react: { text: 'ℹ️', key: m.key }
    })
    return conn.reply(m.chat, `
╭─ℹ️ *SIN OBJETIVOS* ℹ️─╮
│ No hay otros administradores que puedan ser revelados.
│ El bot es el único con poder ritual.
╰────────────────────────╯`.trim(), m)
  }

  // 🧠 Registro simbólico de revelación
  global.db.data.revelaciones ??= {}
  global.db.data.revelaciones[m.chat] ??= []
  for (let id of adminsADegradar) {
    if (!global.db.data.revelaciones[m.chat].includes(id)) {
      global.db.data.revelaciones[m.chat].push(id)
    }
  }

  await conn.sendMessage(m.chat, {
    react: { text: '🧨', key: m.key }
  })

  const lista = adminsADegradar.map(jid => `• @${jid.split('@')[0]}`).join('\n')

  const mensaje = `
╭━〔 🧨 *REVELACIÓN ACTIVADA* 〕━╮
┃ 🔻 Se ha revelado el exceso de poder.
┃ 🏷️ Grupo: *${grupoInfo.subject}*
┃ 👥 Administradores detectados:
${lista}
┃ 🗂️ Registro actualizado en el centro de datos de Shizuka.
┃ ⚠️ El equilibrio ha sido simbólicamente restaurado.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim()

  return conn.reply(m.chat, mensaje, m, { mentions: adminsADegradar })
}

handler.help = ['revelar']
handler.tags = ['grupo']
handler.command = ['revelar']
handler.group = true
handler.rowner = true
handler.botAdmin = true

export default handler