let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("《✧》 Pasa el link del canal, no soy adivino.\n> *Ejemplo:* .reactlink https://whatsapp.com/channel/0029Va4K")

  const processingMsg = await conn.sendMessage(m.chat, { text: '✨ *Extrayendo datos del canal...*' }, { quoted: m })

  try {
    const channelCode = text.match(/https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)?.[1]
    if (!channelCode) throw new Error("Link inválido. Intenta con uno que sí funcione.")

    const metadata = await conn.newsletterMetadata('invite', channelCode)
    const newsletterJid = metadata.id

    const response = await conn.query({
      tag: 'newsletter',
      attrs: { type: 'get', jid: newsletterJid },
      content: [{ tag: 'messages', attrs: { count: '1' } }]
    })

    const node = response?.content?.[0]
    if (!node || node.tag !== 'messages') throw new Error("No pude encontrar mensajes en este canal. Quizá está muerto.")

    const lastMsgId = node.content[0].attrs.id
    const emojis = ['🔥', '😂', '🤡', '💀', '❤️']

    for (const emoji of emojis) {
      await conn.sendMessage(newsletterJid, {
        react: {
          text: emoji,
          key: { 
            remoteJid: newsletterJid, 
            id: lastMsgId, 
            fromMe: false 
          }
        }
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    await conn.sendMessage(m.chat, {
      text: `✅ *Bombardeo completado.* Reaccioné al mensaje con ID: ${lastMsgId}`,
      edit: processingMsg.key
    })

  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, {
      text: `❌ *Fallo técnico:* ${error.message}\n\n> *Nota:* Si esto falla, actualiza tu librería a @whiskeysockets/baileys@latest. No seas tacaño con las actualizaciones.`,
      edit: processingMsg.key
    })
  }
}

handler.help = ['react']
handler.tags = ['tools']
handler.command = ['reaction', 'react']
handler.group = true

export default handler
