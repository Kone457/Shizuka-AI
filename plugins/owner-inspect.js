let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `> Ejemplo de uso:\n.inspect https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v`,
        m
      )
    }

    if (text.includes('https://whatsapp.com/channel/')) {
      let i = await getInfo(conn, text)

      // Solo enviar el JID una vez
      await m.reply(i.id)

      // Reacción correcta
      await conn.sendMessage(m.chat, { react: { text: "☑️", key: m.key } })
    } else {
      return conn.reply(m.chat, `🌱 Ingresa un link válido.`, m)
    }
  } catch (error) {
    console.error(error)
    await conn.reply(
      m.chat,
      `❌ Error al obtener la información del canal:\n> ${error.message}`,
      m
    )
  }
}

handler.command = ['inspector', 'inspect', 'id']
handler.help = ['inspect <url>']
handler.tags = ['tools']
handler.owner = false

export default handler

async function getInfo(conn, url) {
  const match = url.match(/https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)
  if (!match)
    throw new Error(
      'El enlace proporcionado no es válido o no pertenece a un canal de WhatsApp.'
    )

  const channelId = match[1]

  try {
    const info = await conn.newsletterMetadata('invite', channelId)
    return { id: info.id } // JID real
  } catch (error) {
    throw new Error(`No se pudo obtener la información del canal: ${error.message}`)
  }
}