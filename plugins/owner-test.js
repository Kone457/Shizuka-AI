
let lastChannelMsg = {}

export async function before(m, { conn }) {
  if (m.chat.endsWith('@newsletter')) {
    lastChannelMsg[m.chat] = m
  }
}

let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `🌷 Ejemplo de uso:\n.react https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v 🥺`,
        m
      )
    }

    const [url, emoji] = text.split(/\s+/)
    if (!url || !emoji) return conn.reply(m.chat, '🌱 Ingresa un link válido y un emoji.', m)

    const match = url.match(/channel\/([0-9A-Za-z]+)/i)
    if (!match) return conn.reply(m.chat, '❌ Enlace inválido.', m)

    const channelId = match[1]
    const jid = channelId + '@newsletter'

    const lastMsg = lastChannelMsg[jid]
    if (!lastMsg) {
      return conn.reply(m.chat, '❌ No tengo registrado ningún mensaje reciente de ese canal.', m)
    }

    await conn.sendMessage(jid, { react: { text: emoji, key: lastMsg.key } })
    await m.reply(`☑️ Reaccioné con ${emoji} al último mensaje del canal.`)

  } catch (error) {
    console.error(error)
    await conn.reply(m.chat, `❌ Error al reaccionar:\n> ${error.message}`, m)
  }
}

handler.command = ['react']
handler.help = ['react <url> <emoji>']
handler.tags = ['tools']
handler.owner = true

export default handler