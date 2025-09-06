let contadorMensajes = {}

var handler = async (m, { conn, usedPrefix, command, text }) => {
  const grupoID = m.chat
  const grupoInfo = await conn.groupMetadata(grupoID)
  const participantes = grupoInfo.participants || []

  // Ignorar si el mensaje es del bot
  if (m.fromMe) return

  // Inicializar grupo si no existe
  if (!contadorMensajes[grupoID]) {
    contadorMensajes[grupoID] = {}
  }

  // Inicializar usuario si no existe
  if (!contadorMensajes[grupoID][m.sender]) {
    contadorMensajes[grupoID][m.sender] = 0
  }

  // Incrementar contador
  contadorMensajes[grupoID][m.sender]++

  // Comando: .contador
  if (command === 'contador') {
    const ranking = participantes
      .map(p => {
        const id = p.id
        const nombre = conn.getName(id)
        const count = contadorMensajes[grupoID][id] || 0
        return { id, nombre, count }
      })

    // Ordenar por cantidad
    ranking.sort((a, b) => b.count - a.count)

    // Top 5
    const top = await Promise.all(
      ranking.slice(0, 5).map(async (r, i) => {
        const nombre = await r.nombre
        return `${i + 1}. ${nombre} — ${r.count} mensajes 🌸`
      })
    )

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

handler.help = ['mensajes']
handler.tags = ['grupo']
handler.command = ['contador']
handler.group = true
handler.fail = null

export default handler