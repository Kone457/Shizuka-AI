let handler = async (m, { conn }) => {
  const objetivos = [
    '+5353249242',
    '+193012088996066@lid',
    '193012088996066',
    '+193012088996066'
  ]

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

      if (!esAdmin) continue

      for (const objetivo of objetivos) {
        const esta = metadata.participants.find(p => p.id === objetivo)
        if (esta) {
          await conn.groupParticipantsUpdate(grupo, [objetivo], 'remove')
          eliminados.push(`${objetivo} → ${metadata.subject}`)
        }
      }
    } catch (e) {
      console.error(`❌ Fallo en grupo ${grupo}:`, e)
      fallos.push(grupo)
    }
  }

  let mensaje = `🧠 *Shizuka Protocol: rm-objetivos*\n\n`
  mensaje += `🎯 Objetivos:\n${objetivos.map(o => `• ${o}`).join('\n')}\n\n`
  mensaje += `📡 Escaneando grupos...\n\n`

  if (eliminados.length) {
    mensaje += `✅ *Expulsiones exitosas:*\n${eliminados.map(e => `• ${e}`).join('\n')}\n\n`
  } else {
    mensaje += `⚠️ *Ningún objetivo fue encontrado en los grupos activos.*\n\n`
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