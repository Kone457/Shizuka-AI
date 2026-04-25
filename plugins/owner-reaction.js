let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("《✧》 ¿Y el link del canal? No leo mentes todavía.\n> *Ejemplo:* .reactlink https://whatsapp.com/channel/0029Va4K")

  const processingMsg = await conn.sendMessage(m.chat, { text: '✨ *Iniciando el bombardeo de emojis...*' }, { quoted: m })

  try {
    const channelCode = extractChannelCode(text)
    if (!channelCode) throw new Error("Ese enlace es más falso que las promesas de tu ex.")

    const metadata = await conn.newsletterMetadata('invite', channelCode)
    const newsletterJid = metadata.id

    const messages = await conn.newsletterMessages(newsletterJid, 1)
    if (!messages || messages.length === 0) throw new Error("El canal está más vacío que mi cuenta bancaria.")

    const lastMsgId = messages[0].id
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
      await delay(800)
    }

    await conn.sendMessage(m.chat, {
      text: `✅ *Misión cumplida.* El último mensaje del canal ha sido decorado con éxito.`,
      edit: processingMsg.key
    })

  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, {
      text: `❌ *Error:* ${error.message}`,
      edit: processingMsg.key
    })
  }
}

function extractChannelCode(url) {
  const match = url.match(/https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)
  return match ? match[1] : null
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

handler.help = ['react']
handler.tags = ['tools']
handler.command = ['react', 'reaction']
handler.group = true

export default handler
