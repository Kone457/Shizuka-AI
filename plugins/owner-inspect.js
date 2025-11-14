let handler = async (m, { text }) => {
  if (!text) return m.reply('🌷 Ejemplo de uso:\n.inspect https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v')

  if (text.includes('https://whatsapp.com/channel/')) {
    // Extraer el slug del enlace
    const match = text.match(/channel\/([0-9A-Za-z]+)/i)
    if (!match) return m.reply('❌ Enlace inválido.')

    // Construir el JID
    const channelJid = match[1] + '@newsletter'

    // Enviar solo el JID
    await m.reply(channelJid)
  } else {
    return m.reply('🌱 Ingresa un link válido.')
  }
}

handler.command = ['inspect']
handler.help = ['inspect <url>']
handler.tags = ['tools']
handler.owner = true

export default handler