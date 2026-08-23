import ws from 'ws'

let handler = async (m, { conn, args }) => {
  if (args.length < 2) return m.reply('✿ Usa: *.react <link> <emoji>*')

  const linkRegex = /channel\/([0-9A-Za-z]+)\/([0-9]+)/i
  const match = args[0].match(linkRegex)
  if (!match) return m.reply('✿ Link inválido.')

  const channelId = match[1]
  const postId = match[2]
  const emoji = args[1]

  try {
    await conn.sendMessage(`${channelId}@newsletter`, {
      react: { text: emoji, key: { id: postId, remoteJid: `${channelId}@newsletter` } }
    })
    m.reply(`✅ Reacción enviada: ${emoji}`)
  } catch (e) {
    m.reply(`❌ Error al reaccionar: ${e.message}`)
  }
}

handler.tags = ['serbot']
handler.command = ['react']

export default handler