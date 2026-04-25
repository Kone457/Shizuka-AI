let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("《 ✧ 》 **SISTEMA**: Proporcione un enlace de canal válido.\n> *Uso:* .reactlink https://whatsapp.com/channel/0029Va4K")

  const processingMsg = await conn.sendMessage(m.chat, { text: '✨ **ESTADO**: Estableciendo conexión con el canal...' }, { quoted: m })

  try {
    const channelCode = text.match(/https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)?.[1]
    if (!channelCode) throw new Error("Vínculo de canal no identificado.")

    const metadata = await conn.newsletterMetadata('invite', channelCode)
    const newsletterJid = metadata.id

    await conn.sendMessage(m.chat, { text: '✨ **ESTADO**: Sincronizando metadatos y localizando contenido...', edit: processingMsg.key })

    const messages = await conn.newsletterFetchMessages('invite', channelCode, 1)
    
    if (!messages || messages.length === 0) throw new Error("No se detectó actividad reciente en el canal.")

    const lastMsgServerId = messages[0].server_id
    const emojis = ['🔥', '👏', '❤️', '✨', '⚡']

    await conn.sendMessage(m.chat, { text: '✨ **ESTADO**: Ejecutando secuencia de reacciones...', edit: processingMsg.key })

    for (const emoji of emojis) {
      await conn.newsletterReactMessage(newsletterJid, lastMsgServerId, emoji)
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    await conn.sendMessage(m.chat, {
      text: `✅ **OPERACIÓN FINALIZADA**\n\n> **Canal:** ${metadata.name}\n> **Mensaje ID:** ${lastMsgServerId}\n> **Estado:** Reacciones enviadas con éxito.`,
      edit: processingMsg.key
    })

  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, {
      text: `❌ **ERROR DE SISTEMA**\n\n> **Detalle:** ${error.message}`,
      edit: processingMsg.key
    })
  }
}

handler.help = ['react']
handler.tags = ['owner']
handler.command = ['reaction', 'react']
handler.group = true
handler.owner = true

export default handler
