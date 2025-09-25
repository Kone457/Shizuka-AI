let handler = async (m, { conn, participants, isBotAdmin, isAdmin }) => {
  if (!isAdmin) return m.reply(`🚫 *Acceso denegado.*\n\nSolo oficiales con rango pueden activar la ruleta emocional.`)
  if (!isBotAdmin) return m.reply(`🛑 *Acción no autorizada.*\n\nShizuka necesita rango de administrador para girar la ruleta.`)

  const grupo = await conn.groupMetadata(m.chat)
  const administradores = grupo.participants.filter(u => u.admin).map(u => u.id)
  const candidatos = participants.map(u => u.id).filter(id => !administradores.includes(id) && id !== conn.user.jid)

  if (candidatos.length === 0) {
    return m.reply(`📋 *No hay miembros disponibles para la ruleta.*\n🎯 Todos tienen rango o ya fueron seleccionados.`)
  }

  const elegido = candidatos[Math.floor(Math.random() * candidatos.length)]

  const frases = [
    '🌟 Hoy el aura grupal te ha elegido',
    '🎭 El caos te señala con cariño',
    '🧠 Tu mente es el ritual del día',
    '🔥 Tu energía será la chispa del grupo',
    '🪞 El reflejo emocional eres tú',
    '📦 Abre el paquete emocional, sin miedo',
    '🎉 Celebra sin razón, ritualiza sin permiso',
    '🧩 Eres la pieza que faltaba hoy',
    '🌙 La noche te guarda un secreto',
    '🧭 El grupo gira en torno a ti'
  ]

  const fraseElegida = frases[Math.floor(Math.random() * frases.length)]

  await conn.sendMessage(m.chat, {
    text: `🎰 *Ruleta Grupal Activada*\n\n🎯 *Miembro seleccionado:* @${elegido.split('@')[0]}\n💬 *Mensaje ritualizado:* ${fraseElegida}`,
    mentions: [elegido],
    contextInfo: {
      externalAdReply: {
        title: '🎰 Ruleta Emocional',
        body: 'Validación grupal desde NagiBot',
        thumbnailUrl: 'https://qu.ax/ruletabot.jpg',
        sourceUrl: 'https://nagi.bot',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false
      }
    }
  })
}

handler.help = ['ruleta2']
handler.tags = ['fun']
handler.command = ['ruleta2']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler