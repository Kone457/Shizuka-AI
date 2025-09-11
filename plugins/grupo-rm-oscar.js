let handler = async (m, { conn, command }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender
  if (!target) {
    return m.reply(`👀 *Falta objetivo, comandante.*\n\n🔎 Usa:\n*${command} @usuario*\n\n🗺️ Etiqueta o responde al usuario que deseas eliminar globalmente.`)
  }

  const botNumber = conn.user.jid
  const grupos = Object.entries(conn.chats)
    .filter(([id, chat]) => id.endsWith('@g.us') && chat.isGroup)
    .map(([id]) => id)

  let eliminados = []
  let fallos = []

  for (const grupo of grupos) {
    try {
      const metadata = await conn.groupMetadata(grupo)
      const esAdmin = metadata.participants.find(p => p.id === botNumber)?.admin
      const esta = metadata.participants.find(p => p.id === target)

      if (esAdmin && esta) {
        await conn.groupParticipantsUpdate(grupo, [target], 'remove')
        eliminados.push(metadata.subject)
      }
    } catch (e) {
      console.error(`❌ Fallo en grupo ${grupo}:`, e)
      fallos.push(grupo)
    }
  }

  const nombreTarget = await conn.getName(target)
  let mensaje = `🧠 *Shizuka Protocol: expulsión-global*\n\n`
  mensaje += `🎯 Objetivo: *${nombreTarget}*\n📡 Escaneando grupos...\n\n`

  if (eliminados.length) {
    mensaje += `✅ *Expulsado de:*\n${eliminados.map(g => `• ${g}`).join('\n')}\n\n`
  } else {
    mensaje += `⚠️ *El objetivo no fue encontrado en ningún grupo activo.*\n\n`
  }

  if (fallos.length) {
    mensaje += `🚨 *Fallos en:*\n${fallos.map(g => `• ${g}`).join('\n')}\n\n`
    mensaje += `🔐 Verifica permisos o estado de los grupos.`
  }

  await m.reply(mensaje)
}

handler.help = ['rm @usuario']
handler.tags = ['group']
handler.command = ['rm', 'rm-global', 'purga']
handler.owner = true

export default handler