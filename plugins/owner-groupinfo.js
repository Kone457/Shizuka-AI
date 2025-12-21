let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `> Ejemplo de uso:\n.ginfo https://chat.whatsapp.com/JQfFmOLb8VcEPQNyZDH8dm`,
        m
      )
    }

    if (text.includes('https://chat.whatsapp.com/')) {
      let info = await getGroupInfoFromLink(conn, text)

      let caption = `📂 *Información del grupo*\n\n` +
        `🏷️ Nombre: ${info.subject}\n` +
        `📝 Descripción: ${info.desc || 'Sin descripción'}\n` +
        `🆔 ID: ${info.id}\n`

      if (info.participants) {
        caption += `👥 Participantes: ${info.participants.length}\n`
      }

      if (info.picture) {
        await conn.sendMessage(m.chat, { image: { url: info.picture }, caption }, { quoted: m })
      } else {
        await conn.reply(m.chat, caption + `\n📸 Foto: No disponible`, m)
      }

      await conn.sendMessage(m.chat, { react: { text: "☑️", key: m.key } })
    } else {
      return conn.reply(m.chat, `🌱 Ingresa un link válido de invitación.`, m)
    }
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
handler.help = ['ginfo <link>']
handler.tags = ['tools']
handler.owner = true

export default handler

async function getGroupInfoFromLink(conn, url) {
  const match = url.match(/https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]+)/i)
  if (!match)
    throw new Error('El enlace proporcionado no es válido o no pertenece a un grupo de WhatsApp.')

  const inviteCode = match[1]

  try {
    const invite = await conn.groupGetInviteInfo(inviteCode)
    const jid = invite.id

    let metadata, participants
    try {
      metadata = await conn.groupMetadata(jid)
      participants = metadata.participants
    } catch {
      metadata = invite
      participants = null
    }

    const picture = await conn.profilePictureUrl(jid, 'image').catch(() => invite.picture || null)

    return {
      id: metadata.id,
      subject: metadata.subject,
      desc: metadata.desc,
      participants,
      picture
    }
  } catch (error) {
    throw new Error(`No se pudo obtener la información del grupo: ${error.message}`)
  }
}