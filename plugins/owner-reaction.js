let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `《✧》 Uso correcto:\n.reactlink https://whatsapp.com/channel/1234`,
        m
      )
    }

    const match = text.match(/https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)
    if (!match) return conn.reply(m.chat, `《✧》 Eso ni siquiera parece un link de canal. Inténtalo de nuevo.`, m)

    const newsletterId = match[1]
    
    
    let metadata = await conn.newsletterMetadata('invite', newsletterId)
    
    
    let messages = await conn.newsletterMessages(metadata.id, 1)
    
    if (!messages || messages.length === 0) {
      throw new Error("No encontré ni un triste mensaje al cual reaccionar.")
    }

    const lastMsg = messages[0]
    const emojis = ['😂', '🔥', '❤️', '👏', '✨']

    
    for (const emoji of emojis) {
      await conn.sendMessage(metadata.id, {
        react: {
          text: emoji,
          key: { 
            remoteJid: metadata.id, 
            id: lastMsg.id, 
            fromMe: false 
          }
        }
      })
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    await conn.reply(m.chat, `✅Completado con éxito.`, m)

  } catch (error) {
    console.error(error)
    await conn.reply(
      m.chat,
      `❏ Esto falló:\n> ${error.message}`,
      m
    )
  }
}

handler.command = ['react', 'reaction']
handler.help = ['reaction <link>']
handler.tags = ['owner']

export default handler
