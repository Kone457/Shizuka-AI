let handler = async (m, { conn, args }) => {
    let num = parseInt(args[0])

    if (!num || num < 1) {
        return conn.reply(m.chat, '《✧》Usa: #setwarns 5', m)
    }

    let chats = global.db.data.chats
    if (!chats[m.chat]) chats[m.chat] = {}

    chats[m.chat].maxWarns = num

    conn.reply(
        m.chat,
        `✅ Límite de advertencias configurado en *${num}*.`,
        m
    )
}

handler.help = ['setwarns']
handler.tags = ['grupo']
handler.command = ['setwarns']
handler.group = true
handler.admin = true

export default handler