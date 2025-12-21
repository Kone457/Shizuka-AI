let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `> Ejemplo de uso:\n.groupinfo <jid del grupo>`,
        m
      )
    }

    
    if (!text.endsWith('@g.us')) {
      return conn.reply(m.chat, ` Ingresa un JID válido de grupo.`, m)
    }

    let info = await getGroupInfo(conn, text)

    
    let message = `📂 *Información del grupo*\n\n` +
      `🏷️ Nombre: ${info.subject}\n` +
      `📝 Descripción: ${info.desc?.toString() || 'Sin descripción'}\n` +
      `👥 Participantes: ${info.participants.length}\n` +
      `🆔 ID: ${info.id}\n` +
      `📸 Foto: ${info.picture || 'No disponible'}\n`

    await conn.reply(m.chat, message, m)

    
    await conn.sendMessage(m.chat, { react: { text: "☑️", key: m.key } })

  } catch (error) {
    console.error(error)
    await conn.reply(
      m.chat,
      `❌ Error al obtener la información del grupo:\n> ${error.message}`,
      m
    )
  }
}

handler.command = ['groupinfo', 'ginfo']
handler.help = ['groupinfo <jid>']
handler.tags = ['tools']
handler.owner = true

export default handler

async function getGroupInfo(conn, jid) {
  try {
    const metadata = await conn.groupMetadata(jid)
    const picture = await conn.profilePictureUrl(jid, 'image').catch(() => null)

    return {
      id: metadata.id,
      subject: metadata.subject,
      desc: metadata.desc,
      participants: metadata.participants,
      picture
    }
  } catch (error) {
    throw new Error(`No se pudo obtener la información del grupo: ${error.message}`)
  }
}