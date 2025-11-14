var handler = async (m, { text }) => {
  if (!text) return m.reply('> Proporciona la URL del canal de WhatsApp.')

  try {
    // Buscar el patrón de ID en la URL
    const match = text.match(/channel\/([A-Za-z0-9]+)/)
    if (!match) {
      return m.reply('> No se encontró ninguna ID de canal en la URL.')
    }

    const channelId = match[1]

    // Responder con la ID
    await m.reply(`> La ID del canal es:\n${channelId}`)
  } catch (error) {
    console.error(error)
    await m.reply('> Ocurrió un error al inspeccionar la URL.')
  }
}

handler.help = ['inspect <url>']
handler.tags = ['owner']
handler.command = ['inspect']
handler.owner = true

export default handler