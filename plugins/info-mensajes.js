let contador = {}

var handler = async (m, { conn }) => {
  if (!m.fromMe && m.isGroup) {
    const id = m.sender
    contador[id] = (contador[id] || 0) + 1
  }

  if (/^contador$/i.test(m.text)) {
    const grupoInfo = await conn.groupMetadata(m.chat)
    const participantes = grupoInfo.participants.map(p => p.id)
    const ranking = participantes
      .map(id => ({ id, count: contador[id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    let texto = '📖 *Registro de presencia grupal:*\n\n'
    for (let i = 0; i < ranking.length; i++) {
      const nombre = await conn.getName(ranking[i].id)
      texto += `${i + 1}. ${nombre} — ${ranking[i].count} mensajes 🌸\n`
    }

    texto += '\n🕯️ *Cada palabra deja un rastro. Cada rastro forma el círculo.*'
    return conn.reply(m.chat, texto, m)
  }
}

handler.command = /^mensajes$/i
handler.group = true

export default handler