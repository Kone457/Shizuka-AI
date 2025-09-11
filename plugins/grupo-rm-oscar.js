import { jidNormalizedUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, command }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender
  if (!target) {
    return m.reply(`👀 *Falta objetivo, comandante.*\n\n🔎 Usa:\n*${command} @usuario*\n\n🗺️ Etiqueta o responde al usuario que deseas eliminar globalmente.`)
  }

  // Normalizar IDs
  const botNumber = jidNormalizedUser(conn.user.id)
  const targetNorm = jidNormalizedUser(target)

  // Obtener lista de grupos sin importar si chats es Map u objeto
  let grupos = []
  if (conn.chats instanceof Map) {
    grupos = [...conn.chats.entries()]
      .filter(([id, chat]) => id.endsWith('@g.us') && chat.isGroup)
      .map(([id]) => id)
  } else if (typeof conn.chats === 'object') {
    grupos = Object.entries(conn.chats)
      .filter(([id, chat]) => id.endsWith('@g.us') && chat.isGroup)
      .map(([id]) => id)
  }

  let eliminados = []
  let fallos = []

  for (const grupo of grupos) {
    try {
      const metadata = await conn.groupMetadata(grupo)

      const esAdmin = metadata.participants
        .find(p => jidNormalizedUser(p.id) === botNumber)?.admin

      const esta = metadata.participants
        .find(p => jidNormalizedUser(p.id) === targetNorm)

      if (esAdmin && esta) {
        await conn.groupParticipantsUpdate(grupo, [targetNorm], 'remove')
        eliminados.push(metadata.subject)
      }
    } catch (e) {
      console.error(`❌ Fallo en grupo ${grupo}:`, e)
      fallos.push(grupo)
    }
  }

  const nombreTarget = await conn.getName(targetNorm).catch(() => targetNorm)
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