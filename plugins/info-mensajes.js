let contadorMensajes = {}

const handler = async (m, { conn }) => {
  // Ignorar si no es grupo o si el mensaje es del bot
  if (!m.isGroup || m.fromMe) return

  const grupoID = m.chat
  const usuarioID = m.sender

  // Inicializar grupo si no existe
  if (!contadorMensajes[grupoID]) {
    contadorMensajes[grupoID] = {}
  }

  // Inicializar usuario si no existe
  if (!contadorMensajes[grupoID][usuarioID]) {
    contadorMensajes[grupoID][usuarioID] = 0
  }

  // Incrementar contador
  contadorMensajes[grupoID][usuarioID]++

  // Comando: .contador
  if (/^\.contador$/i.test(m.text)) {
    const grupoInfo = await conn.groupMetadata(grupoID)
    const participantes = grupoInfo.participants.map(p => p.id)

    const ranking = participantes
      .map(id => ({
        id,
        nombre: await conn.getName(id),
        count: contadorMensajes[grupoID][id] || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    let texto = '📖 *Registro de presencia grupal:*\n\n'
    for (let i = 0; i < ranking.length; i++) {
      texto += `${i + 1}. ${ranking[i].nombre} — ${ranking[i].count} mensajes 🌸\n`
    }

    texto += '\n🕯️ *Cada palabra deja un rastro. Cada rastro forma el círculo.*'
    return conn.reply(grupoID, texto, m)
  }
}

handler.command = /^mensajes$/i
handler.group = true

export default handler