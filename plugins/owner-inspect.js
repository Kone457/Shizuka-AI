var handler = async (m, { text }) => {
  if (!text) return m.reply('> Proporciona la URL del canal de WhatsApp.')

  try {
    const match = text.match(/channel\/([A-Za-z0-9]+)/)
    if (!match) return m.reply('> No se encontró ninguna ID en la URL.')

    const slug = match[1]
    // Aquí normalmente se resolvería contra la API de WhatsApp
    // Para fines prácticos, devolvemos el JID en formato newsletter
    const channelJid = slug + '@newsletter'

    await m.reply(`> El JID del canal es:\n${channelJid}`)
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