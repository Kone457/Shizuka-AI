import axios from "axios"

let handler = async (m, { conn, args }) => {
  try {
    const id = args?.[0]?.match(/\d+\-\d+@g.us/)?.[0] || m.chat
    const metadata = await conn.groupMetadata(id)
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id)

    const mensajes = Object.values(conn.chats[id]?.messages || {})
    const participantesUnicos = mensajes
      .map(msg => msg?.key?.participant)
      .filter((v, i, a) => v && a.indexOf(v) === i)

    const participantesOrdenados = participantesUnicos
      .filter(p => metadata.participants.some(q => q.id === p)) 
      .sort((a, b) => {
        const isAdminA = admins.includes(a)
        const isAdminB = admins.includes(b)
        if (isAdminA && !isAdminB) return -1
        if (!isAdminA && isAdminB) return 1
        return a.localeCompare(b)
      })

    const adminsList = participantesOrdenados
      .filter(p => admins.includes(p))
      .map(p => `👑 *@${p.split("@")[0]}* (admin)`)

    const usersList = participantesOrdenados
      .filter(p => !admins.includes(p))
      .map(p => `🌐 *@${p.split("@")[0]}*`)

    const resultado = [
      "🎀 *Sistema Shizuka - Escaneo de Presencia en Línea*\n",
      adminsList.length ? `👑 *Administradores activos:*\n${adminsList.join("\n")}\n` : "",
      usersList.length ? `👥 *Miembros activos:*\n${usersList.join("\n")}` : "✧ No hay otros usuarios en línea.",
      "\n🌸 _Información procesada con precisión por Shizuka._"
    ].join("\n")

    await conn.sendMessage(
      m.chat,
      {
        text: resultado,
        contextInfo: { mentionedJid: participantesOrdenados }
      },
      { quoted: m }
    )

    await m.react("🌸")
  } catch (error) {
    console.error(error)
    await m.reply(
      `🚨 *Shizuka detectó un fallo durante el escaneo.*\n\n📄 Detalles técnicos: ${error.message}\n\n🔧 Verifica que el grupo esté activo, con mensajes recientes y que Shizuka tenga acceso completo.`
    )
  }
}

handler.help = ["listonline"]
handler.tags = ["group"]
handler.command = ["listonline", "online", "linea", "enlinea"]
handler.group = true

export default handler