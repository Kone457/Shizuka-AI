let handler = async (m, { conn }) => {
  const objetivo = '+5353249242' // Número a eliminar
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
      const estaOscar = metadata.participants.find(p => p.id === objetivo)

      if (esAdmin && estaOscar) {
        await conn.groupParticipantsUpdate(grupo, [objetivo], 'remove')
        eliminados.push(metadata.subject)
      }
    } catch (e) {
      console.error(`❌ Fallo en grupo ${grupo}:`, e)
      fallos.push(grupo)
    }
  }

  let mensaje = `🧠 *Shizuka Protocol: rm-oscar*\n\n`
  mensaje += `🎯 Objetivo: *${objetivo}*\n`
  mensaje += `📡 Escaneando grupos...\n\n`

  if (eliminados.length) {
    mensaje += `✅ *Expulsado de:*\n${eliminados.map(g => `• ${g}`).join('\n')}\n\n`
  } else {
    mensaje += `⚠️ *No se encontró al objetivo en ningún grupo activo.*\n\n`
  }

  if (fallos.length) {
    mensaje += `🚨 *Fallos en:*\n${fallos.map(g => `• ${g}`).join('\n')}\n\n`
    mensaje += `🔐 Verifica permisos o estado de los grupos.`
  }

  await m.reply(mensaje)
}

handler.help = ['rm-oscar']
handler.tags = ['group']
handler.command = ['rm-oscar']
handler.owner = true

export default handler