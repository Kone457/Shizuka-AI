var handler = async (m, { conn }) => {
  try {
    const msgs = await conn.fetchMessages(m.chat, 100)
    if (!msgs.length) return conn.reply(m.chat, `✧ No se encontraron mensajes recientes para eliminar.`, m)

    for (let msg of msgs) {
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: msg.key.id,
            participant: msg.key.participant
          }
        })
      } catch (e) {
        console.log(`Error al eliminar mensaje:`, e)
      }
    }

    await conn.reply(m.chat, `✦ Los últimos 100 mensajes del grupo han sido eliminados...`, m)
  } catch (err) {
    console.error(err)
    conn.reply(m.chat, `✧ Hubo un error al intentar eliminar los mensajes.`, m)
  }
}

handler.help = ['delall']
handler.tags = ['grupo']
handler.command = ['delall']
handler.admin = true
handler.botAdmin = true

export default handler