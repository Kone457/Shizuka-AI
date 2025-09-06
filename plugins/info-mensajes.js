let contadorMensajes = {}

var handler = async (m, { conn, usedPrefix, command }) => {
  const grupoID = m.chat
  const grupoInfo = await conn.groupMetadata(grupoID)
  const participantes = grupoInfo.participants || []

  // Inicializar grupo si no existe
  if (!contadorMensajes[grupoID]) {
    contadorMensajes[grupoID] = {}
  }

  // Contar el mensaje si no es del bot
  if (!m.fromMe) {
    const usuarioID = m.sender
    contadorMensajes[grupoID][usuarioID] = (contadorMensajes[grupoID][usuarioID] || 0) + 1
  }

  // Comando: .contador
  if (command === 'contador') {
    const ranking = await Promise.all(
      participantes.map(async p => {
        const id = p.id
        const nombre = await conn.getName(id)
        const count = contadorMensajes[grupoID][id] || 0
        return { nombre, count }
      })
    )

    ranking.sort((a, b) => b.count - a.count)

    const top = ranking.slice(0, 5).map((r, i) => {
      return `${i + 1}. ${r.nombre} — ${r.count} mensajes 🌸`
    })

    const mensaje = `
📖 *Registro de presencia grupal:*

${top.join('\n')}

🕯️ *Cada palabra deja un rastro. Cada rastro forma el círculo.*`.trim()

    await conn.sendMessage(m.chat, {
      react: { text: '📊', key: m.key }
    })

    return conn.reply(m.chat, mensaje, m)
  }
}

handler.help = ['contador']
handler.tags = ['grupo']
handler.command = ['contador']
handler.group = true
export default handler