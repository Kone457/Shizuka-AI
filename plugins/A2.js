let handler = async (m, { conn, participants, isBotAdmin, isAdmin }) => {
  if (!isAdmin) return m.reply(`🚫 *Acceso denegado.*\n\nSolo oficiales con rango pueden activar la ruleta total.`)
  if (!isBotAdmin) return m.reply(`🛑 *Acción no autorizada.*\n\nShizuka necesita rango de administrador para ejecutar la purga definitiva.`)

  const grupo = await conn.groupMetadata(m.chat)
  const administradores = grupo.participants.filter(u => u.admin).map(u => u.id)

  let expulsables = participants.map(u => u.id).filter(id => !administradores.includes(id) && id !== conn.user.jid)

  if (expulsables.length === 0) {
    return m.reply(`📋 *No hay miembros expulsables.*\n🎯 Solo quedan oficiales y el bot.`)
  }

  await m.reply(`💣 *Ruleta Total Activada*\n\n🎰 *Miembros a eliminar:* ${expulsables.length}\n⚔️ *Iniciando expulsión sin pausa...*`)

  const frases = [
    '🎭 El caos te ha elegido, valiente',
    '🔥 Tu energía será recordada en las llamas del log',
    '🧩 La pieza se retira, el grupo se adapta',
    '🌙 La noche te acompaña fuera del círculo',
    '📦 Tu paquete emocional será archivado',
    '🧭 Tu ruta se desvía del ritual',
    '💫 El aura grupal te libera',
    '🪞 El reflejo emocional se despide de ti',
    '🎉 Celebraste, ahora toca partir',
    '🧠 Tu mente será extrañada en el ritual grupal'
  ]

  while (expulsables.length > 0) {
    const elegido = expulsables[Math.floor(Math.random() * expulsables.length)]
    const frase = frases[Math.floor(Math.random() * frases.length)]

    await conn.sendMessage(m.chat, {
      text: `🎯 *Seleccionado:* @${elegido.split('@')[0]}\n💬 *Mensaje ritualizado:* ${frase}\n⚔️ *Ejecutando expulsión...*`,
      mentions: [elegido],
      contextInfo: {
        externalAdReply: {
          title: '💣 Ruleta Total',
          body: 'Purga emocional desde NagiBot',
          thumbnailUrl: 'https://qu.ax/irETA.jpg',
          sourceUrl: 'https://nagi.bot',
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }
    })

    try {
      await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove')
      expulsables = expulsables.filter(id => id !== elegido)
      await delay(2000)
    } catch (e) {
      console.error(`❌ No se pudo expulsar a ${elegido}`, e)
      expulsables = expulsables.filter(id => id !== elegido)
    }
  }

  await m.reply(`✅ *Purga completada.*\n📦 Todos los miembros no administrativos han sido removidos.\n🧭 *Aura grupal reiniciada.*`)
}

handler.help = ['ruleta2']
handler.tags = ['group', 'fun']
handler.command = ['ruleta2']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}