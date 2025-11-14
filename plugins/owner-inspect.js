let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `🌷 Ejemplo de uso:\n.inspect https://whatsapp.com/channel/0029Vb63Kf9KwqSQLOQOtk3N`,
        m
      )
    }

    if (text.includes('https://whatsapp.com/channel/')) {
      let i = await getInfo(conn, text)

      // Mostrar info ritualizada
      await conn.relayMessage(
        m.chat,
        {
          extendedTextMessage: {
            text: i.id, // aquí solo mostramos el JID
            contextInfo: {}
          }
        },
        { quoted: m }
      )

      // Responder con el JID puro
      await m.reply(i.id)
      m.react('☑️')
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

    // Solo devolvemos el JID real
    return {
      id: info.id
    }
  } catch (error) {
    throw new Error(`No se pudo obtener la información del canal: ${error.message}`)
  }
}